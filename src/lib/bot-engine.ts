// src/lib/bot-engine.ts
// Takes a parsed query, runs valuation + battery logic, returns WhatsApp reply text.

import { prisma } from "@/lib/prisma";
import { parseMessage, type ParsedQuery } from "./bot-parser";

const GRADE_THRESHOLDS = [
  { grade: "A", min: 88, label: "Excellent — like new" },
  { grade: "B", min: 76, label: "Good — normal wear" },
  { grade: "C", min: 62, label: "Fair — noticeable degradation" },
  { grade: "D", min: 48, label: "Poor — negotiate hard" },
  { grade: "F", min:  0, label: "Replace soon" },
];

// Known original WLTP ranges for common Pakistan EVs (km)
const EV_ORIGINAL_RANGE: Record<string, number> = {
  "byd-atto-3":     480,
  "byd-atto-2":     400,
  "byd-seal":       570,
  "byd-dolphin":    340,
  "mg-zs-ev":       440,
  "tesla-model-3":  560,
  "tesla-model-y":  530,
  "chery-omoda-e5": 430,
  "deepal-s07":     900,  // REEV
};

function fmt(n: number) {
  return `PKR ${(n / 1_000_000).toFixed(2)}M`;
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

// ── Find best matching EV in DB ───────────────────────────────────────────────
async function findEv(q: ParsedQuery) {
  if (!q.brand) return null;

  const evs = await prisma.evModel.findMany({
    where: {
      brand: { contains: q.brand },
      availableInPk: true,
    } as any,
    select: { slug: true, brand: true, model: true, variant: true, pricePkrMin: true, specs: { select: { rangeWltp: true, rangeRealWorld: true } } },
  });

  if (!evs.length) return null;
  if (!q.model)   return evs[0]; // first match for the brand

  // Score each by how many words from user model appear in DB model name
  const modelWords = q.model.toLowerCase().split(/\s+/);
  let best = evs[0], bestScore = 0;
  for (const ev of evs) {
    const name = `${ev.model} ${ev.variant ?? ""}`.toLowerCase();
    const score = modelWords.filter(w => name.includes(w)).length;
    if (score > bestScore) { best = ev; bestScore = score; }
  }
  return best;
}

// ── Pull real market prices from scraped listings ─────────────────────────────
async function marketPrices(evName: string, city: string | null) {
  const where: any = {
    source: { not: "MANUAL" },
    status: "ACTIVE",
    evName: { contains: evName.split(" ")[0] }, // match on brand at least
  };
  if (city) where.city = city;

  const listings = await prisma.listing.findMany({
    where,
    select: { price: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  if (listings.length < 3) return null;
  const prices = listings.map(l => l.price).sort((a, b) => a - b);
  const mid = prices[Math.floor(prices.length / 2)];
  return { median: mid, count: prices.length, min: prices[0], max: prices[prices.length - 1] };
}

// ── Valuation (mirrors the API logic, no HTTP call needed) ────────────────────
function calculateValue(basePrice: number, year: number, odometer: number) {
  const age = new Date().getFullYear() - year;
  const deprMap: Record<number, number> = { 0: 0.05, 1: 0.15, 2: 0.23, 3: 0.31, 4: 0.38 };
  const agePct = age >= 5 ? 0.45 : (deprMap[age] ?? 0.45);
  const excessKm = Math.max(0, odometer - 20000);
  const mileagePct = Math.min(0.20, (excessKm / 10000) * 0.015);
  const totalDepr = Math.min(0.75, agePct + mileagePct);
  const mid = Math.round(basePrice * (1 - totalDepr));
  const spread = Math.round(mid * 0.07);
  return { min: mid - spread, max: mid + spread, mid };
}

// ── Battery reply section ─────────────────────────────────────────────────────
function batterySection(q: ParsedQuery, evSlug: string | null) {
  const knownRange = evSlug ? (EV_ORIGINAL_RANGE[evSlug] ?? null) : null;

  // User gave both ranges — calculate live grade
  if (q.originalRange && q.currentRange) {
    const pct = Math.round((q.currentRange / q.originalRange) * 100);
    const grade = GRADE_THRESHOLDS.find(g => pct >= g.min) ?? GRADE_THRESHOLDS[4];
    return (
      `🔋 *Battery: Grade ${grade.grade}* (${pct}% retained)\n` +
      `${grade.label}\n` +
      `${pct < 76 ? "⚠️ Negotiate PKR 3–8 lakh off asking price." : "✅ Battery is healthy."}`
    );
  }

  // We know original range — tell buyer what to ask
  if (knownRange) {
    const goodMin = Math.round(knownRange * 0.88);
    const fairMin = Math.round(knownRange * 0.76);
    return (
      `🔋 *Battery check:*\n` +
      `Ask dealer: _"Original range was ${knownRange}km — what shows on full charge?"_\n` +
      `• Above ${goodMin}km → Grade A/B ✅\n` +
      `• ${fairMin}–${goodMin}km → Grade C — negotiate PKR 3–5L off\n` +
      `• Below ${fairMin}km → Grade D/F — walk away or PKR 8L off`
    );
  }

  return (
    `🔋 *Battery:* Unknown — ask dealer for current range on full charge.\n` +
    `Send me: _orig [original km] now [current km]_ for instant grade.`
  );
}

// ── Auto-create listing from WhatsApp ad ─────────────────────────────────────
const GRADE_TO_HEALTH: Record<string, number> = { A: 95, B: 83, C: 70, D: 56, F: 40 };
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://ewheelz.pk";

async function autoCreateListing(q: ParsedQuery): Promise<string> {
  const { randomBytes } = await import("crypto");
  const sellerToken = randomBytes(20).toString("hex");
  const evName = `${q.brand} ${q.model ?? ""}`.trim();

  const listing = await prisma.listing.create({
    data: {
      evName,
      price: q.dealerPrice!,
      year: q.year ?? new Date().getFullYear(),
      mileage: q.odometer ?? undefined,
      city: q.city ?? "Pakistan",
      condition: q.condition ?? "USED",
      batteryHealth: q.batteryHealth ? (GRADE_TO_HEALTH[q.batteryHealth] ?? null) : null,
      contactPhone: q.contactPhone,
      contactWhatsapp: q.contactPhone,
      status: "ACTIVE",
      source: "WHATSAPP",
      sellerToken,
    } as any,
  });

  const listingUrl = `${BASE_URL}/en/listings`;
  const manageUrl  = `${BASE_URL}/en/listings/manage/${listing.id}?token=${sellerToken}`;

  return (
    `✅ *Your ${evName} is now live on eWheelz!*\n\n` +
    `🔗 Browse: ${listingUrl}\n\n` +
    `🔒 *Manage your listing (save this link):*\n${manageUrl}\n\n` +
    `_Use the manage link to mark as sold or update price._\n` +
    `Reply with your listing text anytime to post another.`
  );
}

// ── Main: generate WhatsApp reply ─────────────────────────────────────────────
export async function generateReply(text: string): Promise<string> {
  const q = parseMessage(text);

  // ── Listing intent: dealer posting an ad ───────────────────────────────────
  if (q.isListingIntent) {
    return autoCreateListing(q);
  }

  // Can't do anything without a brand
  if (!q.brand) {
    return (
      `👋 *eWheelz Bot*\n\n` +
      `Send me details of the EV you're looking at:\n\n` +
      `_BYD Atto 3 2023 45000km Karachi_\n\n` +
      `Optional: add dealer price\n` +
      `_dealer asking 8.5M_\n\n` +
      `I'll tell you if the price is fair and whether the battery is healthy.`
    );
  }

  const ev = await findEv(q);
  const evLabel = ev
    ? `${ev.brand} ${ev.model}`
    : `${q.brand}${q.model ? " " + titleCase(q.model) : ""}`;

  const year     = q.year     ?? new Date().getFullYear() - 1;
  const odometer = q.odometer ?? 30000;
  const city     = q.city     ?? "Pakistan";

  // Price calculation
  let priceSection = "";
  if (ev?.pricePkrMin) {
    const val = calculateValue(ev.pricePkrMin, year, odometer);

    // Enrich with real scraped market data if available
    const market = await marketPrices(evLabel, q.city);
    const sourceNote = market
      ? `_(based on ${market.count} real listings in ${city})_`
      : `_(formula-based — improves as listings grow)_`;

    priceSection = `💰 *Fair market price: ${fmt(val.min)} – ${fmt(val.max)}*\n${sourceNote}`;

    if (q.dealerPrice) {
      const diff = q.dealerPrice - val.mid;
      if (diff > 100_000) {
        priceSection += `\n⚠️ Dealer is *${fmt(diff)} OVER* market — you can negotiate.`;
      } else if (diff < -100_000) {
        priceSection += `\n✅ Dealer price is *${fmt(Math.abs(diff))} below* market — good deal.`;
      } else {
        priceSection += `\n✅ Dealer price is *fair market rate.*`;
      }
    }
  } else {
    priceSection = `💰 No price data for ${evLabel} yet — check ewheelz.com/ev-valuation`;
  }

  const battery = batterySection(q, ev?.slug ?? null);

  const header = `*${evLabel}* · ${year} · ${odometer.toLocaleString()} km · ${city}\n`;
  const footer = `\n📋 Full report: ewheelz.com/battery-health?evName=${encodeURIComponent(evLabel)}&year=${year}&odometer=${odometer}`;

  return `${header}\n${priceSection}\n\n${battery}${footer}`;
}
