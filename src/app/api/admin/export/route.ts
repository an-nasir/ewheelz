// src/app/api/admin/export/route.ts
// GET /api/admin/export?key=ADMIN_KEY
// Dumps full DB as a single JSON snapshot — use to backup before Neon migration.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "ewheelz-admin-change-me";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("key") !== ADMIN_KEY)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
