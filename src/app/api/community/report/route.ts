// src/app/api/community/report/route.ts
// POST /api/community/report — unified endpoint for all community report types

import { NextRequest, NextResponse } from "next/server";
import { communityDb } from "@/lib/communityDb";

// ─── Validation helpers ────────────────────────────────────────────────────────
// Rejects: NaN, Infinity, -Infinity, scientific-notation extremes, out-of-range.

function clamp(val: unknown, min: number, max: number): number | undefined {
  const n = Number(val);
  // Block non-finite values (NaN, ±Infinity, scientific-notation extremes)
  if (!Number.isFinite(n)) return undefined;
  // Block values outside the allowed range
  if (n < min || n > max) return undefined;
  return n;
}

function requireClamp(val: unknown, min: number, max: number, field: string): number {
  const n = clamp(val, min, max);
  if (n === undefined) {
    throw new RangeError(`${field} must be a finite number between ${min} and ${max}. Received: ${val}`);
  }
  return n;
}

// Field-level limits
const LIMITS = {
  batteryPct:    { min: 0,   max: 100    },
  distanceKm:    { min: 0.1, max: 2000   },
  kwhAdded:      { min: 0,   max: 200    },
  costPkr:       { min: 0,   max: 200000 },
  chargeMin:     { min: 0,   max: 600    },
  speedKmh:      { min: 0,   max: 250    },
  tempC:         { min: -20, max: 60     },
  effWhKm:       { min: 50,  max: 500    },
  rangeKm:       { min: 1,   max: 1500   },
};

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const type = String(body.type ?? "");

    switch (type) {
      // ── Charging session ──────────────────────────────────────────────────
      case "charging_session": {
        const startPct = clamp(body.startBatteryPct, LIMITS.batteryPct.min, LIMITS.batteryPct.max);
        const endPct   = clamp(body.endBatteryPct,   LIMITS.batteryPct.min, LIMITS.batteryPct.max);

        // End must be ≥ start if both provided
        if (startPct !== undefined && endPct !== undefined && endPct < startPct) {
          return NextResponse.json(
            { error: "endBatteryPct must be ≥ startBatteryPct" },
            { status: 400 }
          );
        }

        const result = await communityDb.chargingSession.create({
          sessionToken: String(body.sessionToken ?? "anon"),
          vehicleModel: String(body.vehicleModel ?? "Unknown").slice(0, 80),
          stationName:     body.stationName ? String(body.stationName).slice(0, 120) : undefined,
          startBatteryPct: startPct,
          endBatteryPct:   endPct,
          kwhAdded:        clamp(body.kwhAdded,        LIMITS.kwhAdded.min,   LIMITS.kwhAdded.max),
          costPkr:         clamp(body.costPkr,         LIMITS.costPkr.min,    LIMITS.costPkr.max),
          chargingTimeMin: clamp(body.chargingTimeMin, LIMITS.chargeMin.min,  LIMITS.chargeMin.max),
        });
        return NextResponse.json({ ok: true, id: result.id });
      }

      // ── Station report ────────────────────────────────────────────────────
      case "station_report": {
        const status = String(body.status ?? "available");
        if (!["available", "busy", "broken"].includes(status)) {
          return NextResponse.json({ error: "status must be available | busy | broken" }, { status: 400 });
        }
        const stationId = String(body.stationId ?? "").trim();
        if (!stationId) {
          return NextResponse.json({ error: "stationId is required" }, { status: 400 });
        }
        const result = await communityDb.stationReport.create({
          stationId,
          stationName: body.stationName ? String(body.stationName).slice(0, 120) : undefined,
          status: status as "available" | "busy" | "broken",
          queueLength: clamp(body.queueLength, 0, 50) ?? 0,
        });
        return NextResponse.json({ ok: true, id: result.id });
      }

      // ── Trip log ──────────────────────────────────────────────────────────
      case "trip_log": {
        const dist = requireClamp(body.distanceKm, LIMITS.distanceKm.min, LIMITS.distanceKm.max, "distanceKm");

        const batUsed = clamp(body.batteryUsedPct, LIMITS.batteryPct.min, LIMITS.batteryPct.max);
        const kwhUsed = clamp(body.kwhUsed, 0.1, LIMITS.kwhAdded.max);

        // Derive efficiency if possible
        const effWhKm = (() => {
          if (body.efficiencyWhKm !== undefined) {
            return clamp(body.efficiencyWhKm, LIMITS.effWhKm.min, LIMITS.effWhKm.max);
          }
          if (kwhUsed && dist) {
            const derived = (kwhUsed * 1000) / dist;
            return clamp(derived, LIMITS.effWhKm.min, LIMITS.effWhKm.max);
          }
          return undefined;
        })();

        const result = await communityDb.tripLog.create({
          sessionToken: String(body.sessionToken ?? "anon"),
          vehicleModel: String(body.vehicleModel ?? "Unknown").slice(0, 80),
          distanceKm:     dist,
          batteryUsedPct: batUsed,
          avgSpeedKmh:    clamp(body.avgSpeedKmh,   LIMITS.speedKmh.min, LIMITS.speedKmh.max),
          temperatureC:   clamp(body.temperatureC,   LIMITS.tempC.min,    LIMITS.tempC.max),
          acOn:           Boolean(body.acOn),
          kwhUsed,
          efficiencyWhKm: effWhKm,
        });
        return NextResponse.json({ ok: true, id: result.id });
      }

      // ── Efficiency report ─────────────────────────────────────────────────
      case "efficiency_report": {
        const eff = requireClamp(body.efficiencyWhKm, LIMITS.effWhKm.min, LIMITS.effWhKm.max, "efficiencyWhKm");
        const result = await communityDb.efficiencyReport.create({
          sessionToken: String(body.sessionToken ?? "anon"),
          vehicleModel: String(body.vehicleModel ?? "Unknown").slice(0, 80),
          efficiencyWhKm: eff,
          distanceKm:   clamp(body.distanceKm,   LIMITS.distanceKm.min, LIMITS.distanceKm.max),
          temperatureC: clamp(body.temperatureC, LIMITS.tempC.min,      LIMITS.tempC.max),
          routeType:    ["city", "highway", "mixed"].includes(String(body.routeType))
            ? String(body.routeType) : "mixed",
        });
        return NextResponse.json({ ok: true, id: result.id });
      }

      // ── Range feedback ────────────────────────────────────────────────────
      case "range_feedback": {
        const feedback = String(body.feedback ?? "");
        if (!["accurate", "over_estimated", "under_estimated"].includes(feedback)) {
          return NextResponse.json({ error: "feedback must be accurate | over_estimated | under_estimated" }, { status: 400 });
        }
        const result = await communityDb.rangeFeedback.create({
          evSlug: String(body.evSlug ?? "").slice(0, 60),
          predictedRangeKm: clamp(body.predictedRangeKm, LIMITS.rangeKm.min, LIMITS.rangeKm.max),
          actualRangeKm:    clamp(body.actualRangeKm,    LIMITS.rangeKm.min, LIMITS.rangeKm.max),
          feedback: feedback as "accurate" | "over_estimated" | "under_estimated",
          conditions: body.conditions ? String(body.conditions).slice(0, 200) : undefined,
        });
        return NextResponse.json({ ok: true, id: result.id });
      }

      default:
        return NextResponse.json({ error: `Unknown report type: ${type}` }, { status: 400 });
    }
  } catch (err) {
    if (err instanceof RangeError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[community/report]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
