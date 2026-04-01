// src/app/api/admin/export/route.ts
// Exports all data as JSON or CSV.
// GET /api/admin/export?type=listings&format=json&key=YOUR_ADMIN_KEY
// GET /api/admin/export?type=evmodels&format=csv&key=YOUR_ADMIN_KEY
//
// types: listings | evmodels | leads | all
// format: json (default) | csv

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "ewheelz-admin-change-me";

function toCsv(rows: Record<string, any>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map(row =>
      headers.map(h => {
        const val = row[h] ?? "";
        const s = String(val).replace(/"/g, '""');
        return s.includes(",") || s.includes("\n") ? `"${s}"` : s;
      }).join(",")
    ),
  ];
  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key    = searchParams.get("key");
  const type   = searchParams.get("type")   ?? "listings";
  const format = searchParams.get("format") ?? "json";

  if (key !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let data: any = {};

  if (type === "listings" || type === "all") {
    data.listings = await prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, evName: true, price: true, year: true,
        mileage: true, city: true, condition: true,
        batteryHealth: true, status: true,
        source: true, sourceUrl: true,
        contactPhone: true, contactWhatsapp: true,
        description: true, createdAt: true,
      },
    });
  }

  if (type === "evmodels" || type === "all") {
    data.evModels = await prisma.evModel.findMany({
      orderBy: { brand: "asc" },
      include: { specs: true, battery: true },
    });
  }

  if (type === "leads" || type === "all") {
    data.leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  // ── CSV (single type only) ─────────────────────────────────────────────────
  if (format === "csv") {
    const rows = data.listings ?? data.evModels ?? data.leads ?? [];
    const csv = toCsv(rows.map((r: any) => ({
      ...r,
      createdAt: r.createdAt?.toISOString?.() ?? r.createdAt ?? "",
      updatedAt: r.updatedAt?.toISOString?.() ?? r.updatedAt ?? "",
    })));
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="ewheelz-${type}-${Date.now()}.csv"`,
      },
    });
  }

  // ── JSON ───────────────────────────────────────────────────────────────────
  const payload = JSON.stringify(
    { exportedAt: new Date().toISOString(), ...data },
    null, 2
  );

  return new NextResponse(payload, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="ewheelz-${type}-${Date.now()}.json"`,
    },
  });
}
