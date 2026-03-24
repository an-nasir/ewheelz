// src/app/api/cost-calculator/route.ts
// POST /api/cost-calculator — EV vs petrol cost comparison

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Pakistan averages (March 2025)
const PETROL_PRICE_PKR_PER_LITRE = 293; // PKR
const PETROL_CAR_KM_PER_LITRE = 12;    // average petrol car fuel economy
const CO2_EV_KG_PER_KWH = 0.40;        // Pakistan grid emissions factor
const CO2_PETROL_KG_PER_LITRE = 2.31;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      evSlug,
      distanceKm,
      electricityPricePkr = 50, // PKR per kWh (home charging)
      petrolPricePkr = PETROL_PRICE_PKR_PER_LITRE,
      petrolCarKmPerLitre = PETROL_CAR_KM_PER_LITRE,
    } = body;

    if (!evSlug || !distanceKm) {
      return NextResponse.json(
        { error: "Required: evSlug, distanceKm" },
        { status: 400 }
      );
    }

    const distance = Number(distanceKm);
    if (distance <= 0 || distance > 20000) {
      return NextResponse.json({ error: "distanceKm must be between 1 and 20000" }, { status: 400 });
    }

    const ev = await prisma.evModel.findUnique({ where: { slug: evSlug } });
    if (!ev) {
      return NextResponse.json({ error: `EV not found: ${evSlug}` }, { status: 404 });
    }

    const evAny = ev as Record<string, unknown>;
    const specs = (evAny.specs as Record<string, unknown>) ?? {};

    const rangeRealWorld = (specs.rangeRealWorld as number) ?? 300;
    const batteryCapKwh = (specs.batteryCapKwh as number) ?? 60;
    const efficiencyWhKm = (specs.efficiencyWhKm as number) ??
      Math.round((batteryCapKwh / rangeRealWorld) * 1000);

    // EV cost
    const energyKwh = (distance * efficiencyWhKm) / 1000;
    const evCostPkr = Math.round(energyKwh * Number(electricityPricePkr));

    // Petrol equivalent
    const litresNeeded = distance / Number(petrolCarKmPerLitre);
    const petrolCostPkr = Math.round(litresNeeded * Number(petrolPricePkr));

    const savingsPkr = petrolCostPkr - evCostPkr;
    const savingsPct = Math.round((savingsPkr / petrolCostPkr) * 100);

    // CO2
    const co2Ev = (energyKwh * CO2_EV_KG_PER_KWH);
    const co2Petrol = (litresNeeded * CO2_PETROL_KG_PER_LITRE);
    const co2SavedKg = Math.round((co2Petrol - co2Ev) * 10) / 10;

    // Charging info
    const chargesNeeded = Math.ceil(distance / rangeRealWorld);
    const costPerKm = evCostPkr / distance;

    return NextResponse.json({
      evModel: `${evAny.brand} ${evAny.model}`,
      evSlug,
      distanceKm: distance,
      efficiencyWhKm,
      energyKwh: Math.round(energyKwh * 10) / 10,
      electricityPricePkr: Number(electricityPricePkr),
      evCostPkr,
      petrolPricePkr: Number(petrolPricePkr),
      petrolCarKmPerLitre: Number(petrolCarKmPerLitre),
      petrolCostPkr,
      savingsPkr,
      savingsPct,
      co2SavedKg,
      co2EvKg: Math.round(co2Ev * 10) / 10,
      co2PetrolKg: Math.round(co2Petrol * 10) / 10,
      chargesNeeded,
      costPerKm: Math.round(costPerKm * 100) / 100,
      // Monthly / annual projections
      monthly: {
        evCostPkr: Math.round(evCostPkr * 22),       // ~22 working days
        petrolCostPkr: Math.round(petrolCostPkr * 22),
        savingsPkr: Math.round(savingsPkr * 22),
      },
      annual: {
        evCostPkr: Math.round(evCostPkr * 260),       // ~260 working days
        petrolCostPkr: Math.round(petrolCostPkr * 260),
        savingsPkr: Math.round(savingsPkr * 260),
        co2SavedKg: Math.round(co2SavedKg * 260),
      },
    });
  } catch (err) {
    console.error("Cost calc error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
