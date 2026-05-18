// src/app/api/admin/export/route.ts
// GET /api/admin/export?key=ADMIN_API_KEY
// Dumps full DB as a single JSON snapshot — use to backup before Neon migration.

import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const [
    listings, evModels, chargingStations,
    articles, leads, priceAlerts, subscribers,
    affiliateLinks,
  ] = await Promise.all([
    prisma.listing.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.evModel.findMany({
      include: { specs: true, battery: true, charging: true },
      orderBy: { brand: "asc" },
    }),
    prisma.chargingStation.findMany(),
    prisma.article.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.lead.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.priceAlert.findMany(),
    prisma.newsletterSubscriber.findMany(),
    prisma.affiliateLink.findMany(),
  ]);

  const payload = JSON.stringify({
    exportedAt: new Date().toISOString(),
    listings, evModels, chargingStations,
    articles, leads, priceAlerts, subscribers,
    affiliateLinks,
  });

  return new NextResponse(payload, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="ewheelz-snapshot-${Date.now()}.json"`,
    },
  });
}
