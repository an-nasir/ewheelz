// src/app/api/ev-valuation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface ValuationInput {
  evSlug: string;
  year: number;
  odometer: number;          // km
  batteryGrade: "A" | "B" | "C" | "D" | "F" | "unknown";
  city: string;
  condition: "excellent" | "good" | "fair" | "rough";
}

export interface ValuationResult {
  evName: string;
  newPricePkr: number;
  estimatedMin: number;
  estimatedMax: number;
  midpoint: number;
  depreciationPct: number;
  breakdown: { label: string; impact: string; value: string }[];
  advice: string;
  listingCta: boolean;
}

const MAJOR_CITIES = ["karachi", "lahore", "islamabad", "rawalpindi"];

export async function POST(req: NextRequest) {
  const body: ValuationInput = await req.json();

  const ev = await prisma.evModel.findUnique({
    where: { slug: body.evSlug } as any,
    select: { brand: true, model: true, variant: true, pricePkrMin: true, pricePkrMax: true }
  });

  if (!ev || !ev.pricePkrMin) {
    return NextResponse.json({ error: "EV not found or missing price data" }, { status: 404 });
  }

  const basePrice = ev.pricePkrMin;
  const age = new Date().getFullYear() - body.year;
  const evName = `${ev.brand} ${ev.model}${ev.variant ? " " + ev.variant : ""}`;

  // ── Depreciation by age ────────────────────────────────────────────────────
  const deprMap: Record<number, number> = { 0: 0.05, 1: 0.15, 2: 0.23, 3: 0.31, 4: 0.38 };
  const agePct = age >= 5 ? 0.45 : (deprMap[age] ?? 0.45);

  // ── Mileage penalty (beyond 20k km, -1.5% per 10k) ────────────────────────
  const excessKm = Math.max(0, body.odometer - 20000);
  const mileagePct = Math.min(0.20, (excessKm / 10000) * 0.015);

  // ── Battery grade discount ─────────────────────────────────────────────────
  const batteryDiscount: Record<string, number> = {
    A: 0, B: 0.03, C: 0.08, D: 0.15, F: 0.25, unknown: 0.05
  };
  const batteryPct = batteryDiscount[body.batteryGrade] ?? 0.05;

  // ── City factor ────────────────────────────────────────────────────────────
  const inMajorCity = MAJOR_CITIES.includes(body.city.toLowerCase().trim());
  const cityPct = inMajorCity ? 0 : 0.05;

  // ── Condition ─────────────────────────────────────────────────────────────
  const conditionMap = { excellent: -0.03, good: 0, fair: 0.06, rough: 0.13 };
  const conditionPct = conditionMap[body.condition];

  const totalDeduction = agePct + mileagePct + batteryPct + cityPct + conditionPct;
  const depreciationPct = Math.min(0.75, totalDeduction);

  const midpoint = Math.round(basePrice * (1 - depreciationPct));
  const spread = Math.round(midpoint * 0.07); // ±7% range
  const estimatedMin = midpoint - spread;
  const estimatedMax = midpoint + spread;

  const fmt = (n: number) => `PKR ${(n / 1_000_000).toFixed(2)}M`;
  const pct = (n: number) => n === 0 ? "—" : `-${Math.round(n * 100)}%`;

  return NextResponse.json({
    evName,
    newPricePkr: basePrice,
    estimatedMin,
    estimatedMax,
    midpoint,
    depreciationPct: Math.round(depreciationPct * 100),
    breakdown: [
      { label: "New Price",       impact: "base",     value: fmt(basePrice) },
      { label: `Age (${age} yr)`, impact: pct(agePct),      value: fmt(basePrice * agePct) },
      { label: `Mileage (${body.odometer.toLocaleString()} km)`, impact: pct(mileagePct), value: fmt(basePrice * mileagePct) },
      { label: `Battery (Grade ${body.batteryGrade})`, impact: pct(batteryPct), value: fmt(basePrice * batteryPct) },
      { label: `City (${body.city})`, impact: pct(cityPct), value: cityPct ? fmt(basePrice * cityPct) : "No penalty" },
      { label: `Condition (${body.condition})`, impact: conditionPct < 0 ? `+${Math.abs(Math.round(conditionPct*100))}%` : pct(conditionPct), value: conditionPct !== 0 ? fmt(Math.abs(basePrice * conditionPct)) : "—" },
    ],
    advice:
      depreciationPct > 0.45 ? "Heavy depreciation. Price aggressively or expect to negotiate 10-15% down." :
      depreciationPct > 0.30 ? "Fair market range. Buyer will negotiate — keep 8% room." :
      "Strong value retention. You're in a good position to sell at asking price.",
    listingCta: true,
  } as ValuationResult);
}
