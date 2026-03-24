export const dynamic = "force-dynamic";
// src/app/api/trip-planner/route.ts
// POST /api/trip-planner — EV trip planning with charging stops

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findCity } from "@/lib/cities";
import { planTrip } from "@/lib/tripPlanner";
import { ChargingStation } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      originCity,
      destinationCity,
      evSlug,
      batteryPct,
      drivingStyle = "normal",
      temperatureC = 30,
      acOn = true,
    } = body;

    // Validate required fields
    if (!originCity || !destinationCity || !evSlug || batteryPct === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: originCity, destinationCity, evSlug, batteryPct" },
        { status: 400 }
      );
    }

    if (batteryPct < 1 || batteryPct > 100) {
      return NextResponse.json(
        { error: "batteryPct must be between 1 and 100" },
        { status: 400 }
      );
    }

    // Resolve city coordinates
    const origin = findCity(originCity);
    const destination = findCity(destinationCity);

    if (!origin) {
      return NextResponse.json(
        { error: `City not found: "${originCity}". Try a major Pakistan city.` },
        { status: 404 }
      );
    }
    if (!destination) {
      return NextResponse.json(
        { error: `City not found: "${destinationCity}". Try a major Pakistan city.` },
        { status: 404 }
      );
    }

    if (origin.name === destination.name) {
      return NextResponse.json(
        { error: "Origin and destination must be different cities." },
        { status: 400 }
      );
    }

    // Get EV model with specs
    const ev = await prisma.evModel.findUnique({ where: { slug: evSlug } });
    if (!ev) {
      return NextResponse.json({ error: `EV model not found: ${evSlug}` }, { status: 404 });
    }

    // Extract specs — use safe fallbacks
    const evAny = ev as Record<string, unknown>;
    const specs = (evAny.specs as Record<string, unknown>) ?? {};
    const battery = (evAny.battery as Record<string, unknown>) ?? {};

    const rangeRealWorld = (specs.rangeRealWorld as number) ?? (specs.rangeWltp as number) ?? 300;
    const batteryCapKwh = (specs.batteryCapKwh as number) ?? (battery.capacityKwh as number) ?? 60;
    const chargingDcKw = (specs.chargingDcKw as number) ?? 50;
    const efficiencyWhKm = (specs.efficiencyWhKm as number) ?? Math.round((batteryCapKwh / rangeRealWorld) * 1000);

    // Get all charging stations
    const rawStations = (await prisma.chargingStation.findMany({})) as unknown as ChargingStation[];

    // Plan trip
    const result = planTrip({
      origin,
      destination,
      evRange: rangeRealWorld,
      batteryCapKwh,
      chargingDcKw,
      efficiencyWhKm,
      batteryPct: Number(batteryPct),
      drivingStyle,
      temperatureC: Number(temperatureC),
      acOn: Boolean(acOn),
      stations: rawStations,
    });

    return NextResponse.json({
      ...result,
      evModel: `${evAny.brand} ${evAny.model}`,
      evSlug,
      inputs: { originCity, destinationCity, batteryPct, drivingStyle, temperatureC, acOn },
    });
  } catch (err) {
    console.error("Trip planner error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/trip-planner — return available cities and EV models for the form
export async function GET() {
  const { getAllCityNames } = await import("@/lib/cities");
  const models = await prisma.evModel.findMany({ where: { availableInPk: true } });
  return NextResponse.json({
    cities: getAllCityNames(),
    evModels: (models as unknown as Record<string, unknown>[]).map((m) => ({
      slug: m.slug,
      label: `${m.brand} ${m.model}`,
      range: (m.specs as Record<string, unknown>)?.rangeRealWorld ?? null,
    })),
  });
}
