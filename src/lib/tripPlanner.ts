// src/lib/tripPlanner.ts — EV trip planning logic
// Core algorithm: pure functions, no DB calls here
// DB calls happen in the API route

import { ChargingStation, TripPlanResult, ChargingStop } from "@/types";
import { CityCoord } from "./cities";

// ─── Constants ────────────────────────────────────────────────────────────────

const AVERAGE_SPEED_KMH = 90; // Pakistan highway average
const SAFETY_MARGIN = 0.10; // Keep 10% battery reserve
const TARGET_SOC_AFTER_CHARGE = 0.80; // Charge to 80% at each stop
const ROUTE_CORRIDOR_KM = 80; // Search within 80km of direct route
const MIN_CHARGE_PCT = 0.15; // Stop to charge when below 15%

// ─── Haversine ────────────────────────────────────────────────────────────────

export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Point-to-segment distance ────────────────────────────────────────────────
// Returns the shortest km distance from a point to the line segment A→B

export function pointToSegmentKm(
  px: number, py: number, // point
  ax: number, ay: number, // segment start
  bx: number, by: number  // segment end
): number {
  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) return haversineKm(py, px, ay, ax);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return haversineKm(py, px, ay + t * dy, ax + t * dx);
}

// ─── Range adjustment based on conditions ────────────────────────────────────

export function adjustedRange(
  nominalRangeKm: number,
  options: {
    drivingStyle?: string;
    temperatureC?: number;
    acOn?: boolean;
  }
): number {
  let multiplier = 1.0;

  // Driving style
  if (options.drivingStyle === "eco") multiplier *= 1.10;
  if (options.drivingStyle === "sport") multiplier *= 0.82;

  // Temperature (LFP/NMC both degrade in extreme heat/cold)
  const temp = options.temperatureC ?? 25;
  if (temp < 5) multiplier *= 0.82;
  else if (temp < 15) multiplier *= 0.90;
  else if (temp > 40) multiplier *= 0.88;
  else if (temp > 45) multiplier *= 0.80;

  // AC
  if (options.acOn) multiplier *= 0.92;

  return nominalRangeKm * multiplier;
}

// ─── Main trip planner ────────────────────────────────────────────────────────

export interface TripInput {
  origin: CityCoord;
  destination: CityCoord;
  evRange: number;          // real-world range km at 100%
  batteryCapKwh: number;
  chargingDcKw: number;
  efficiencyWhKm: number;   // Wh per km
  batteryPct: number;       // 0–100
  drivingStyle?: string;
  temperatureC?: number;
  acOn?: boolean;
  stations: ChargingStation[];
}

export function planTrip(input: TripInput): TripPlanResult {
  const {
    origin, destination, batteryPct, batteryCapKwh,
    chargingDcKw, efficiencyWhKm, stations,
  } = input;

  // Adjust range for conditions
  const baseRange = adjustedRange(input.evRange, {
    drivingStyle: input.drivingStyle,
    temperatureC: input.temperatureC,
    acOn: input.acOn,
  });

  // Safety usable range = range * battery% * (1 - safety_margin)
  const usableRangeKm = baseRange * (batteryPct / 100) * (1 - SAFETY_MARGIN);
  const totalDistanceKm = haversineKm(
    origin.lat, origin.lng, destination.lat, destination.lng
  );
  const totalEnergyKwh = (totalDistanceKm * efficiencyWhKm) / 1000;

  // Simple case: can reach directly
  if (usableRangeKm >= totalDistanceKm) {
    const driveMins = Math.round((totalDistanceKm / AVERAGE_SPEED_KMH) * 60);
    return {
      canReach: true,
      originCity: origin.name,
      destinationCity: destination.name,
      totalDistanceKm: Math.round(totalDistanceKm),
      totalEnergyKwh: Math.round(totalEnergyKwh * 10) / 10,
      usableRangeKm: Math.round(usableRangeKm),
      stops: [],
      totalChargingTimeMinutes: 0,
      estimatedDrivingTimeMinutes: driveMins,
      estimatedTotalTimeMinutes: driveMins,
    };
  }

  // Find stations in corridor between origin and destination
  const corridorStations = stations.filter((s) => {
    const dist = pointToSegmentKm(
      s.longitude, s.latitude,
      origin.lng, origin.lat,
      destination.lng, destination.lat
    );
    return dist <= ROUTE_CORRIDOR_KM;
  });

  // Sort stations by distance from origin along route
  const withDistances = corridorStations.map((s) => ({
    station: s,
    distFromOrigin: haversineKm(origin.lat, origin.lng, s.latitude, s.longitude),
  }));
  withDistances.sort((a, b) => a.distFromOrigin - b.distFromOrigin);

  // Greedy algorithm: from current position, jump to the farthest reachable station
  const stops: ChargingStop[] = [];
  let currentLat = origin.lat;
  let currentLng = origin.lng;
  let currentRangeKm = usableRangeKm;
  let currentBatteryPct = batteryPct;
  let totalChargeTime = 0;
  let iterations = 0;

  while (iterations < 20) {
    iterations++;
    const distToDestination = haversineKm(currentLat, currentLng, destination.lat, destination.lng);

    if (currentRangeKm >= distToDestination) break; // Can reach destination

    // Find all reachable stations from current position
    const reachable = withDistances.filter((ws) => {
      const d = haversineKm(currentLat, currentLng, ws.station.latitude, ws.station.longitude);
      return d > 0 && d <= currentRangeKm * 0.95; // 95% range to be safe
    });

    if (reachable.length === 0) {
      // Cannot reach any station — trip is not feasible
      const driveMins = Math.round((totalDistanceKm / AVERAGE_SPEED_KMH) * 60);
      return {
        canReach: false,
        originCity: origin.name,
        destinationCity: destination.name,
        totalDistanceKm: Math.round(totalDistanceKm),
        totalEnergyKwh: Math.round(totalEnergyKwh * 10) / 10,
        usableRangeKm: Math.round(usableRangeKm),
        stops,
        totalChargingTimeMinutes: totalChargeTime,
        estimatedDrivingTimeMinutes: driveMins,
        estimatedTotalTimeMinutes: driveMins + totalChargeTime,
        warning: "No charging stations found along this route. More stations needed.",
      };
    }

    // Pick the farthest reachable station that's closest to destination line
    // Sort by: distance from current + closest to destination path
    reachable.sort((a, b) => {
      const da = haversineKm(currentLat, currentLng, a.station.latitude, a.station.longitude);
      const db = haversineKm(currentLat, currentLng, b.station.latitude, b.station.longitude);
      return db - da; // farthest first
    });

    const best = reachable[0];
    const distToStation = haversineKm(currentLat, currentLng, best.station.latitude, best.station.longitude);

    // Calculate battery state when arriving at station
    const kwhUsed = (distToStation * efficiencyWhKm) / 1000;
    const battAtArrival = Math.max(0, currentBatteryPct - (kwhUsed / batteryCapKwh) * 100);

    // Charge to TARGET_SOC_AFTER_CHARGE (80%)
    const targetBattPct = TARGET_SOC_AFTER_CHARGE * 100;
    const kwhToAdd = ((targetBattPct - battAtArrival) / 100) * batteryCapKwh;

    // Charge time: kWh / kW * 60 min (simplified, ignores taper)
    // DC fast chargers: first 80% is mostly fast, last 20% tapers
    const effectiveDcKw = best.station.maxPowerKw > 0
      ? Math.min(best.station.maxPowerKw, chargingDcKw)
      : chargingDcKw;
    const chargeTimeMins = Math.round((kwhToAdd / effectiveDcKw) * 60);
    const costPkr = best.station.pricePerKwh
      ? Math.round(kwhToAdd * best.station.pricePerKwh)
      : null;

    totalChargeTime += chargeTimeMins;

    stops.push({
      station: best.station,
      distanceFromStartKm: Math.round(best.distFromOrigin),
      chargeFromPct: Math.round(battAtArrival),
      chargeToPct: Math.round(targetBattPct),
      chargeTimeMinutes: chargeTimeMins,
      estimatedCostPkr: costPkr,
    });

    // Update state
    currentLat = best.station.latitude;
    currentLng = best.station.longitude;
    currentBatteryPct = targetBattPct;
    currentRangeKm = adjustedRange(input.evRange, {
      drivingStyle: input.drivingStyle,
      temperatureC: input.temperatureC,
      acOn: input.acOn,
    }) * (currentBatteryPct / 100) * (1 - SAFETY_MARGIN);
  }

  const driveMins = Math.round((totalDistanceKm / AVERAGE_SPEED_KMH) * 60);
  return {
    canReach: true,
    originCity: origin.name,
    destinationCity: destination.name,
    totalDistanceKm: Math.round(totalDistanceKm),
    totalEnergyKwh: Math.round(totalEnergyKwh * 10) / 10,
    usableRangeKm: Math.round(usableRangeKm),
    stops,
    totalChargingTimeMinutes: totalChargeTime,
    estimatedDrivingTimeMinutes: driveMins,
    estimatedTotalTimeMinutes: driveMins + totalChargeTime,
  };
}
