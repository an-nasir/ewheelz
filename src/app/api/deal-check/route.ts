// POST /api/deal-check
// Paste any WhatsApp/OLX ad OR a URL → instant deal verdict.
// Pure rule-based: bot-parser + DB price benchmarks. No API key needed.

import { NextRequest, NextResponse } from "next/server";
import { parseMessage } from "@/lib/bot-parser";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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

export async function POST(req: NextRequest) {
  let { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "No text" }, { status: 400 });

  let sourceUrl: string | null = null;

  // If user pasted a URL, fetch and extract the ad text
  if (/^https?:\/\//i.test(text.trim())) {
    sourceUrl = text.trim();
    try {
      text = await fetchAdFromUrl(sourceUrl);
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

  // Pull comparable listings from DB
  const where: Record<string, any> = { status: "ACTIVE" };
  if (parsed.brand) where.evName = { contains: parsed.brand };

  const comps = await prisma.listing.findMany({
    where,
    select: { price: true, mileage: true, batteryHealth: true, city: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const prices = comps.map(c => c.price).filter(Boolean);
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
    if (diff > 15)       { flags.push(`Price is ${diff.toFixed(0)}% above market average`); score -= 20; priceVerdict = `Asking ${diff.toFixed(0)}% above market (avg PKR ${(avgPrice/1e6).toFixed(1)}M)`; }
    else if (diff > 5)   { score -= 8;  priceVerdict = `Slightly above market average (PKR ${(avgPrice/1e6).toFixed(1)}M avg)`; }
    else if (diff < -10) { positives.push(`Priced ${Math.abs(diff).toFixed(0)}% below market`); score += 15; priceVerdict = `${Math.abs(diff).toFixed(0)}% below market — strong deal`; }
    else                 { score += 5;  priceVerdict = `Fair price — within normal market range (PKR ${(avgPrice/1e6).toFixed(1)}M avg)`; }
  } else if (adPrice && !avgPrice) {
    priceVerdict = "Can't compare — no matching listings in our DB yet.";
  }

  // Battery health — skip for new cars
  if (!isNewCar) {
    if (!parsed.batteryHealth)                               { flags.push("Battery health not mentioned — ask for grade"); score -= 10; }
    else if (parsed.batteryHealth === "A")                   { positives.push("Battery grade A — excellent"); score += 15; }
    else if (parsed.batteryHealth === "B")                   { positives.push("Battery grade B — good"); score += 8; }
    else if (["D","F"].includes(parsed.batteryHealth ?? "")) { flags.push(`Battery grade ${parsed.batteryHealth} — inspect carefully`); score -= 15; }
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

  if (!parsed.phone && !sourceUrl) { flags.push("No contact number in ad"); score -= 5; }

  score = Math.max(0, Math.min(100, score));

  const verdict =
    score >= 75 ? "GOOD_DEAL"  :
    score >= 55 ? "FAIR_DEAL"  :
    flags.some(f => f.includes("above market")) ? "OVERPRICED" :
    "RED_FLAGS";

  const negotiationTip =
    verdict === "OVERPRICED" ? `Market avg is PKR ${avgPrice ? (avgPrice/1e6).toFixed(1)+"M" : "unknown"}. Offer that or walk.` :
    verdict === "RED_FLAGS"  ? "Get a battery certificate before any payment. Non-negotiable." :
    verdict === "GOOD_DEAL"  ? "Move fast — priced well. Verify battery grade before closing." :
    "Standard deal. Offer 3–5% below asking and ask for battery certificate.";

  return NextResponse.json({
    parsed,
    sourceUrl,
    isNewCar,
    analysis: { verdict, score, priceVerdict, flags, positives, negotiationTip },
    compsCount: prices.length,
    avgMarketPrice: avgPrice,
    priceRange: minPrice && maxPrice ? { low: minPrice, high: maxPrice } : null,
  });
}
