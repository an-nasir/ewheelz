// src/app/api/cron/sync-stations/route.ts
// Vercel Cron Job — runs daily at 02:00 UTC
// Syncs Pakistan EV charging stations from OpenChargeMap (free API, no key needed)
// Also called at: GET /api/cron/sync-stations?secret=CRON_SECRET

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CRON_SECRET    = process.env.CRON_SECRET    ?? process.env.SEED_SECRET ?? "ewheelz-seed-2025";
const OCM_API_KEY    = process.env.OPEN_CHARGE_MAP_API_KEY ?? "";
const OCM_BASE       = "https://api.openchargemap.io/v3/poi";

// OpenChargeMap status type ID → our status string
const OCM_STATUS: Record<number, string> = {
  0:  "UNKNOWN",
  10: "OPERATIONAL",
  20: "OPERATIONAL",
  30: "BUSY",
  50: "BROKEN",
  75: "BROKEN",
  100: "UNKNOWN",
  150: "BROKEN",
  200: "BROKEN",
};

// OCM connector type ID → our label
const OCM_CONNECTOR: Record<number, string> = {
  1:  "Type 1",
  2:  "Type 2",
  25: "CCS2",
  27: "CHAdeMO",
  28: "GB/T",
  30: "Tesla",
  32: "CCS1",
};

export async function GET(req: NextRequest) {
  // ─── Auth ─────────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  const secretParam = new URL(req.url).searchParams.get("secret");

  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isManual     = secretParam === CRON_SECRET;

  if (!isVercelCron && !isManual) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = { added: 0, updated: 0, errors: 0, total: 0 };

  try {
    // ─── Fetch from OpenChargeMap ────────────────────────────────────────
    const params = new URLSearchParams({
      output:      "json",
      countrycode: "PK",
      maxresults:  "100",
      compact:     "false",
      verbose:     "false",
      ...(OCM_API_KEY ? { key: OCM_API_KEY } : {}),
    });

    const res = await fetch(`${OCM_BASE}?${params}`, {
      headers: { "User-Agent": "eWheelz Pakistan EV Platform" },
      // 10-second timeout
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `OCM API error: ${res.status}` }, { status: 502 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stations: any[] = await res.json();
    results.total = stations.length;

    for (const s of stations) {
      try {
        const addr       = s.AddressInfo;
        const statusId   = s.StatusType?.ID ?? 0;
        const liveStatus = OCM_STATUS[statusId] ?? "UNKNOWN";

        // Collect connector types
        const connectors = (s.Connections ?? [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((c: any) => OCM_CONNECTOR[c.ConnectionTypeID] ?? c.ConnectionType?.Title ?? "Unknown")
          .filter(Boolean);
        const connectorTypes = [...new Set<string>(connectors)].join(",") || "CCS2";

        // Max power
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const maxKw = (s.Connections ?? []).reduce((m: number, c: any) => Math.max(m, c.PowerKW ?? 0), 0);

        const data = {
          name:            addr.Title ?? "Unknown Station",
          latitude:        addr.Latitude,
          longitude:       addr.Longitude,
          network:         s.OperatorInfo?.Title ?? null,
          connectorTypes,
          maxPowerKw:      maxKw > 0 ? maxKw : null,
          city:            addr.Town ?? addr.StateOrProvince ?? "Pakistan",
          country:         "Pakistan",
          address:         [addr.AddressLine1, addr.Town].filter(Boolean).join(", ") || null,
          liveStatus,
          totalSpots:      s.NumberOfPoints ?? 1,
          availableSpots:  liveStatus === "OPERATIONAL" ? (s.NumberOfPoints ?? 1) : 0,
          operationalHours: s.OpeningTimes?.WeekdayText ?? "Unknown",
          pricePerKwh:     null, // OCM doesn't reliably provide pricing
        };

        // Try to match by lat/lng proximity (within ~50m)
        const existing = await prisma.chargingStation.findFirst({
          where: {
            latitude:  { gte: addr.Latitude  - 0.0005, lte: addr.Latitude  + 0.0005 },
            longitude: { gte: addr.Longitude - 0.0005, lte: addr.Longitude + 0.0005 },
          },
        });

        if (existing) {
          await prisma.chargingStation.update({
            where: { id: existing.id },
            data:  { liveStatus, availableSpots: data.availableSpots, connectorTypes, maxPowerKw: data.maxPowerKw },
          });
          results.updated++;
        } else {
          await prisma.chargingStation.create({ data });
          results.added++;
        }
      } catch {
        results.errors++;
      }
    }
  } catch (err) {
    return NextResponse.json({
      error:   "Sync failed",
      detail:  String(err),
      partial: results,
    }, { status: 500 });
  }

  return NextResponse.json({
    success:   true,
    syncedAt:  new Date().toISOString(),
    results,
    totalInDb: await prisma.chargingStation.count(),
  });
}
