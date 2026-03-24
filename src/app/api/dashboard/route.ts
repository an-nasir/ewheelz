// src/app/api/dashboard/route.ts
// GET /api/dashboard?token=<session_token>
// Returns anonymised personal trip & charging stats for the given session token.

import { NextRequest, NextResponse } from "next/server";
import { communityDb } from "@/lib/communityDb";

export const dynamic = "force-dynamic"; // never cache — always fresh personal data

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token")?.trim();

    if (!token || token.length < 4) {
      return NextResponse.json({ error: "token required" }, { status: 400 });
    }

    const [rawTrips, rawSessions] = await Promise.all([
      communityDb.tripLog.getByToken(token),
      communityDb.chargingSession.getByToken(token),
    ]);

    // Normalise column names (snake_case → camelCase) for the client
    const trips = rawTrips.map(t => ({
      vehicleModel:   t.vehicle_model,
      distanceKm:     t.distance_km,
      batteryUsedPct: t.battery_used_pct,
      kwhUsed:        t.kwh_used,
      createdAt:      t.created_at,
    }));

    const sessions = rawSessions.map(s => ({
      vehicleModel:    s.vehicle_model,
      kwhAdded:        s.kwh_added,
      costPkr:         s.cost_pkr,
      chargingTimeMin: s.charging_time_min,
      stationName:     s.station_name,
      createdAt:       s.created_at,
    }));

    return NextResponse.json({ trips, sessions });
  } catch (err) {
    console.error("[api/dashboard]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
