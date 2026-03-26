// src/app/api/dashboard/route.ts
// GET /api/dashboard?token=<session_token>
// Returns anonymised personal trip & charging stats for the given session token.

import { NextRequest, NextResponse } from "next/server";
import { communityDb } from "@/lib/communityDb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token")?.trim();

    let userId = (session?.user as any)?.id;
    let savedEVs: any[] = [];
    let savedStations: any[] = [];

    // If authenticated, we can also fetch saved items
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          savedEVs: {
            select: { brand: true, model: true, variant: true, slug: true, pricePkrMin: true, imageUrl: true }
          },
          savedStations: {
            select: { id: true, name: true, city: true, network: true, maxPowerKw: true, liveStatus: true }
          }
        }
      });
      if (user) {
        savedEVs = user.savedEVs;
        savedStations = user.savedStations;
      }
    }

    // Use token for anonymous sessions
    if (!userId && (!token || token.length < 4)) {
      return NextResponse.json({ error: "No session or token" }, { status: 401 });
    }

    // In a real app, you'd migrate token-data to user-data on first login.
    // For now, we fetch by token as fallback.
    const [rawTrips, rawSessions] = await Promise.all([
      communityDb.tripLog.getByToken(userId || token),
      communityDb.chargingSession.getByToken(userId || token),
    ]);

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

    return NextResponse.json({ trips, sessions, savedEVs, savedStations });
  } catch (err) {
    console.error("[api/dashboard]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
