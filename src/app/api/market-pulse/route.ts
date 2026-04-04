// GET /api/market-pulse — live market stats from our listings DB
// Cached 10 mins — cheap to compute, used on homepage ticker

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 600;

const BRANDS = ["BYD", "MG", "Hyundai", "Changan", "Deepal", "Xpeng", "Tesla"];

export async function GET() {
  const [active, recentSold, allActive] = await Promise.all([
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "SOLD", updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      select: { price: true, evName: true, city: true, evModel: { select: { brand: true } } },
    }),
  ]);

  // Price by brand
  const byBrand: Record<string, number[]> = {};
  const byCity: Record<string, number> = {};

  for (const l of allActive) {
    const brand = l.evModel?.brand ?? BRANDS.find(b => l.evName?.includes(b)) ?? null;
    if (brand) {
      byBrand[brand] = byBrand[brand] ?? [];
      byBrand[brand].push(l.price);
    }
    if (l.city) byCity[l.city] = (byCity[l.city] ?? 0) + 1;
  }

  const brandStats = Object.entries(byBrand)
    .filter(([, prices]) => prices.length >= 2)
    .map(([brand, prices]) => ({
      brand,
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      min: Math.min(...prices),
      count: prices.length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topCity = Object.entries(byCity).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Lahore";

  return NextResponse.json({
    totalActive: active,
    soldThisWeek: recentSold,
    topCity,
    brandStats,
    updatedAt: new Date().toISOString(),
  });
}
