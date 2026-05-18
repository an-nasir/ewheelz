// POST /api/deal-check
// Paste any WhatsApp/OLX ad OR a URL → instant deal verdict.
// Pure rule-based: bot-parser + DB price benchmarks. No API key needed.

import { NextRequest, NextResponse } from "next/server";
import { parseMessage } from "@/lib/bot-parser";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type PriceConfidenceLevel = "HIGH" | "MEDIUM" | "LOW" | "NONE";

interface MarketComp {
  price: number;
  mileage: number | null;
  batteryHealth: number | null;
  city: string;
  evName: string | null;
  evModel: { brand: string; model: string; variant: string | null } | null;
}

// Strip HTML tags + collapse whitespace
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 2000); // keep it short for parser
}

// Fetch a URL and extract meaningful ad text from it
async function fetchAdFromUrl(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; eWheelz/1.0)" },
    signal: AbortSignal.timeout(6000),
  });
  const html = await res.text();

  // Extract title
  const title = html.match(/<title[^>]*>([^<]{3,120})<\/title>/i)?.[1]?.trim() ?? "";

  // Extract OLX price (data attribute or visible price)
  const priceMatch =
    html.match(/data-price="([\d,]+)"/i) ??
    html.match(/["']price["']\s*:\s*["']?([\d,]+)/i) ??
    html.match(/PKR\s*([\d,]+)/i);
  const priceStr = priceMatch ? `PKR ${priceMatch[1]}` : "";

  // Extract meta description (often has year + mileage on OLX)
  const metaDesc =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{10,300})["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']{10,300})["'][^>]+name=["']description["']/i)?.[1] ?? "";

  // Build a combined plain text string for the parser
  return [title, priceStr, metaDesc].filter(Boolean).join(" — ");
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function compName(comp: MarketComp): string {
  if (comp.evModel) {
    return `${comp.evModel.brand} ${comp.evModel.model} ${comp.evModel.variant ?? ""}`;
  }

  return comp.evName ?? "";
}

function matchesParsedModel(comp: MarketComp, model: string | null): boolean {
  if (!model) return false;
  const name = normalizeText(compName(comp));
  const words = normalizeText(model).split(" ").filter(Boolean);
  return words.length > 0 && words.every((word) => name.includes(word));
}

function getPriceConfidence(sameModelCount: number, broadCount: number): {
  level: PriceConfidenceLevel;
  label: string;
  reason: string;
  scope: string;
  multiplier: number;
} {
  if (sameModelCount >= 8) {
    return {
      level: "HIGH",
      label: "High confidence",
      reason: `${sameModelCount} same-model comps found`,
      scope: "same-model",
      multiplier: 1,
    };
  }

  if (sameModelCount >= 3) {
    return {
      level: "MEDIUM",
      label: "Medium confidence",
      reason: `${sameModelCount} same-model comps found`,
      scope: "same-model",
      multiplier: 0.8,
    };
  }

  if (broadCount >= 3) {
    return {
      level: "LOW",
      label: "Low confidence",
      reason: `${broadCount} broad brand comps found; variant may differ`,
      scope: "brand-level",
      multiplier: 0.4,
    };
  }

  return {
    level: "NONE",
    label: "No confidence",
    reason: "Not enough comparable listings yet",
    scope: "none",
    multiplier: 0,
  };
}

export async function POST(req: NextRequest) {
  let { text } = (await req.json()) as { text?: string };
  if (!text?.trim()) return NextResponse.json({ error: "No text" }, { status: 400 });

  let sourceUrl: string | null = null;

  // If user pasted a URL, fetch and extract the ad text
  if (/^https?:\/\//i.test(text.trim())) {
    const pastedUrl = text.trim();
    sourceUrl = pastedUrl;
    try {
      text = await fetchAdFromUrl(pastedUrl);
    } catch {
      return NextResponse.json({ error: "Could not fetch that URL. Paste the ad text directly instead." }, { status: 422 });
    }
  }

  const parsed = parseMessage(text);
  const adPrice = parsed.dealerPrice ?? null;
  const currentYear = new Date().getFullYear();

  // Detect new car signals
  const isNewCar =
    /zero.?meter|brand.?new|unused|factory.?fresh/i.test(text) ||
    parsed.condition === "NEW" ||
    (parsed.year != null && parsed.year >= currentYear && (!parsed.odometer || parsed.odometer < 500));

  // Pull comparable listings from DB. No brand = no market verdict.
  const comps: MarketComp[] = parsed.brand
    ? await prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { evName: { contains: parsed.brand } },
          { evModel: { brand: { contains: parsed.brand } } },
        ],
      } as any,
      select: {
        price: true,
        mileage: true,
        batteryHealth: true,
        city: true,
        evName: true,
        evModel: { select: { brand: true, model: true, variant: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    : [];

  const sameModelComps = comps.filter((comp) => matchesParsedModel(comp, parsed.model));
  const priceConfidence = getPriceConfidence(sameModelComps.length, comps.length);
  const selectedComps = sameModelComps.length >= 3 ? sameModelComps : comps;
  const prices = priceConfidence.level === "NONE"
    ? []
    : selectedComps.map(c => c.price).filter(Boolean);
  const avgPrice = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null;
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;

  // ── Rule engine ───────────────────────────────────────────────────────────
  const flags: string[]     = [];
  const positives: string[] = [];
  let score = 60;

  // New car handling
  if (isNewCar) {
    positives.push("Brand new / zero meter vehicle");
    score += 10;
  }

  // Price vs market
  let priceVerdict = "No comparable market data yet — limited listings.";
  if (adPrice && avgPrice) {
    const diff = ((adPrice - avgPrice) / avgPrice) * 100;
    const weight = priceConfidence.multiplier;
    const avgText = `PKR ${(avgPrice / 1e6).toFixed(1)}M`;
    if (priceConfidence.level === "LOW") {
      flags.push("Price confidence is low because exact model/variant comps are limited");
    }

    if (diff > 15) {
      flags.push(`Asking ${diff.toFixed(0)}% above ${priceConfidence.scope} average`);
      score -= Math.round(20 * weight);
      priceVerdict = `${priceConfidence.label}: asking ${diff.toFixed(0)}% above comps (${avgText} avg)`;
    } else if (diff > 5) {
      score -= Math.round(8 * weight);
      priceVerdict = `${priceConfidence.label}: slightly above comps (${avgText} avg)`;
    } else if (diff < -10) {
      positives.push(`Priced ${Math.abs(diff).toFixed(0)}% below ${priceConfidence.scope} comps`);
      score += Math.round(15 * weight);
      priceVerdict = `${priceConfidence.label}: ${Math.abs(diff).toFixed(0)}% below comps (${avgText} avg)`;
    } else {
      score += Math.round(5 * weight);
      priceVerdict = `${priceConfidence.label}: within normal comp range (${avgText} avg)`;
    }
  } else if (adPrice && !avgPrice) {
    priceVerdict = "Can't compare — no matching listings in our DB yet.";
  }

  // Battery health — skip for new cars
  if (!isNewCar) {
    if (!parsed.batteryHealth)                               { flags.push("Battery condition not mentioned — ask for current full-charge range and OBD report"); score -= 10; }
    else if (parsed.batteryHealth === "A")                   { positives.push("Claimed battery signal A — verify with range/OBD evidence"); score += 10; }
    else if (parsed.batteryHealth === "B")                   { positives.push("Claimed battery signal B — verify before token"); score += 6; }
    else if (["D","F"].includes(parsed.batteryHealth ?? "")) { flags.push(`Claimed battery signal ${parsed.batteryHealth} — inspect carefully`); score -= 15; }
  }

  // Mileage — skip for new cars
  if (!isNewCar) {
    if (!parsed.odometer)              { flags.push("Mileage not stated — always verify odometer"); score -= 5; }
    else if (parsed.odometer > 80000)  { flags.push(`High mileage: ${parsed.odometer.toLocaleString()} km`); score -= 10; }
    else if (parsed.odometer < 30000)  { positives.push(`Low mileage: ${parsed.odometer.toLocaleString()} km`); score += 8; }
  }

  // Year
  if (parsed.year && currentYear - parsed.year >= 4)  { flags.push(`Older model (${parsed.year}) — check warranty`); score -= 5; }
  else if (parsed.year && currentYear - parsed.year <= 1) { positives.push(`Recent model year (${parsed.year})`); score += 5; }

  if (!parsed.contactPhone && !sourceUrl) { flags.push("No contact number in ad"); score -= 5; }

  score = Math.max(0, Math.min(100, score));

  const verdict =
    score >= 75 ? "GOOD_DEAL"  :
    score >= 55 ? "FAIR_DEAL"  :
    flags.some(f => f.includes("above market")) ? "OVERPRICED" :
    "RED_FLAGS";

  const negotiationTip =
    verdict === "OVERPRICED" ? `Market avg is PKR ${avgPrice ? (avgPrice/1e6).toFixed(1)+"M" : "unknown"}. Offer that or walk.` :
    verdict === "RED_FLAGS"  ? "Get a physical battery inspection before any payment. Non-negotiable." :
    verdict === "GOOD_DEAL"  ? "Move fast only after confirming seller identity, documents, and battery evidence." :
    "Standard deal. Offer 3–5% below asking and ask for battery range/OBD evidence.";

  return NextResponse.json({
    parsed,
    sourceUrl,
    isNewCar,
    analysis: { verdict, score, priceVerdict, flags, positives, negotiationTip },
    priceConfidence: {
      level: priceConfidence.level,
      label: priceConfidence.label,
      reason: priceConfidence.reason,
      scope: priceConfidence.scope,
      sameModelComps: sameModelComps.length,
      broadComps: comps.length,
    },
    compsCount: prices.length,
    avgMarketPrice: avgPrice,
    priceRange: minPrice && maxPrice ? { low: minPrice, high: maxPrice } : null,
  });
}
