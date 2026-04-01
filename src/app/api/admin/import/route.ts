// src/app/api/admin/import/route.ts
// Re-imports a JSON export file into the current DB.
// POST /api/admin/import  (body = the exported JSON, header x-admin-key required)
// Safe: skips duplicates by sourceUrl for listings.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "ewheelz-admin-change-me";

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-admin-key");
  if (key !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const stats = { listings: 0, evModels: 0, leads: 0, skipped: 0 };

  // ── Listings ───────────────────────────────────────────────────────────────
  if (Array.isArray(body.listings)) {
    for (const l of body.listings) {
      try {
        // Skip if already exists (sourceUrl unique key for scraped, id for manual)
        const exists = l.sourceUrl
          ? await prisma.listing.findUnique({ where: { sourceUrl: l.sourceUrl } })
          : await prisma.listing.findUnique({ where: { id: l.id } });

        if (exists) { stats.skipped++; continue; }

        await prisma.listing.create({
          data: {
            id:             l.id,
            evName:         l.evName,
            price:          Number(l.price),
            year:           Number(l.year),
            mileage:        l.mileage ? Number(l.mileage) : null,
            city:           l.city ?? "Unknown",
            condition:      l.condition ?? "USED",
            batteryHealth:  l.batteryHealth ? Number(l.batteryHealth) : null,
            status:         l.status ?? "ACTIVE",
            source:         l.source ?? "MANUAL",
            sourceUrl:      l.sourceUrl ?? null,
            contactPhone:   l.contactPhone ?? null,
            contactWhatsapp:l.contactWhatsapp ?? null,
            description:    l.description ?? null,
          },
        });
        stats.listings++;
      } catch { stats.skipped++; }
    }
  }

  // ── Leads ──────────────────────────────────────────────────────────────────
  if (Array.isArray(body.leads)) {
    for (const l of body.leads) {
      try {
        await prisma.lead.upsert({
          where: { id: l.id },
          update: {},
          create: {
            id: l.id, name: l.name, phone: l.phone,
            email: l.email, city: l.city, message: l.message,
            source: l.source, status: l.status ?? "NEW",
            evName: l.evName,
          },
        });
        stats.leads++;
      } catch { stats.skipped++; }
    }
  }

  return NextResponse.json({ ok: true, imported: stats });
}
