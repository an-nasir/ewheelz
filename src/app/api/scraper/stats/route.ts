// src/app/api/scraper/stats/route.ts
// Quick read on scraped data — call this to verify the scraper is working.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [total, bySource, byCity, recentPrices] = await Promise.all([
    prisma.listing.count({ where: { source: { not: "MANUAL" } } as any }),

    prisma.listing.groupBy({
      by: ["source"],
      where: { source: { not: "MANUAL" } } as any,
      _count: true,
    }),

    prisma.listing.groupBy({
      by: ["city"],
      where: { source: { not: "MANUAL" } } as any,
      _count: true,
      orderBy: { _count: { city: "desc" } },
      take: 10,
    }),

    // Recent 20 listings with price for valuation model sanity check
    prisma.listing.findMany({
      where: { source: { not: "MANUAL" } } as any,
      select: { evName: true, price: true, year: true, mileage: true, city: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return NextResponse.json({ total, bySource, byCity, recentPrices });
}
