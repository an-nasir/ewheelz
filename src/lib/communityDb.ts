// src/lib/communityDb.ts — Anonymous community data via Prisma + PostgreSQL
// No user accounts required. All data is anonymised by session token.

import { prisma } from "@/lib/prisma";

// ─── Constants ────────────────────────────────────────────────────────────────

const ELECTRICITY_RATE_PKR = 35;  // PKR per kWh
const PETROL_PRICE_PKR     = 310; // PKR per litre
const PETROL_L_PER_100KM   = 12;  // avg sedan

// ─── Charging Sessions ────────────────────────────────────────────────────────

async function createChargingSession(data: {
  sessionToken: string; vehicleModel: string; stationName?: string;
  startBatteryPct?: number; endBatteryPct?: number; kwhAdded?: number;
  costPkr?: number; chargingTimeMin?: number;
}) {
  const row = await prisma.communitySession.create({
    data: {
      sessionToken:    data.sessionToken,
      vehicleModel:    data.vehicleModel,
      stationName:     data.stationName     ?? null,
      startBatteryPct: data.startBatteryPct ?? null,
      endBatteryPct:   data.endBatteryPct   ?? null,
      kwhAdded:        data.kwhAdded        ?? null,
      costPkr:         data.costPkr         ?? null,
      chargingTimeMin: data.chargingTimeMin  ?? null,
    },
  });
  return { id: row.id };
}

async function getSessionsByToken(sessionToken: string, limit = 50) {
  const rows = await prisma.communitySession.findMany({
    where:   { sessionToken },
    orderBy: { createdAt: "desc" },
    take:    limit,
    select:  {
      vehicleModel: true, kwhAdded: true, costPkr: true,
      chargingTimeMin: true, stationName: true, createdAt: true,
    },
  });
  return rows.map((r) => ({
    vehicle_model:     r.vehicleModel,
    kwh_added:         r.kwhAdded,
    cost_pkr:          r.costPkr,
    charging_time_min: r.chargingTimeMin,
    station_name:      r.stationName,
    created_at:        r.createdAt.toISOString(),
  }));
}

// ─── Station Reports ──────────────────────────────────────────────────────────

async function createStationReport(data: {
  stationId: string; stationName?: string;
  status: "available" | "busy" | "broken"; queueLength?: number;
}) {
  const row = await prisma.stationReport.create({
    data: {
      stationId:   data.stationId,
      stationName: data.stationName  ?? null,
      status:      data.status,
      queueLength: data.queueLength  ?? 0,
    },
  });
  return { id: row.id };
}

async function getStationReliability(stationId: string) {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rows = await prisma.stationReport.groupBy({
    by:     ["status"],
    where:  { stationId, createdAt: { gt: cutoff } },
    _count: { status: true },
  });

  const counts = { available: 0, busy: 0, broken: 0 };
  let total = 0;
  for (const r of rows) {
    const n = r._count.status;
    const s = r.status as keyof typeof counts;
    if (s in counts) counts[s] = n;
    total += n;
  }
  const score = total === 0
    ? null
    : Math.round(((counts.available + counts.busy * 0.5) / total) * 100);
  return { ...counts, total, score };
}

// ─── Trip Logs ────────────────────────────────────────────────────────────────

async function createTripLog(data: {
  sessionToken: string; vehicleModel: string; distanceKm: number;
  batteryUsedPct?: number; avgSpeedKmh?: number; temperatureC?: number;
  acOn?: boolean; kwhUsed?: number; efficiencyWhKm?: number;
}) {
  const eff = data.efficiencyWhKm ??
    (data.kwhUsed && data.distanceKm
      ? Math.round((data.kwhUsed * 1000) / data.distanceKm)
      : null);
  const row = await prisma.tripLog.create({
    data: {
      sessionToken:   data.sessionToken,
      vehicleModel:   data.vehicleModel,
      distanceKm:     data.distanceKm,
      batteryUsedPct: data.batteryUsedPct ?? null,
      avgSpeedKmh:    data.avgSpeedKmh    ?? null,
      temperatureC:   data.temperatureC   ?? null,
      acOn:           data.acOn           ?? false,
      kwhUsed:        data.kwhUsed        ?? null,
      efficiencyWhKm: eff,
    },
  });
  return { id: row.id };
}

async function getTripsByToken(sessionToken: string, limit = 50) {
  const rows = await prisma.tripLog.findMany({
    where:   { sessionToken },
    orderBy: { createdAt: "desc" },
    take:    limit,
    select:  {
      vehicleModel: true, distanceKm: true,
      batteryUsedPct: true, kwhUsed: true, createdAt: true,
    },
  });
  return rows.map((r) => ({
    vehicle_model:    r.vehicleModel,
    distance_km:      r.distanceKm,
    battery_used_pct: r.batteryUsedPct,
    kwh_used:         r.kwhUsed,
    created_at:       r.createdAt.toISOString(),
  }));
}

// ─── Efficiency Reports ───────────────────────────────────────────────────────

async function createEfficiencyReport(data: {
  sessionToken: string; vehicleModel: string; efficiencyWhKm: number;
  distanceKm?: number; temperatureC?: number; routeType?: string;
}) {
  const row = await prisma.efficiencyReport.create({
    data: {
      sessionToken:   data.sessionToken,
      vehicleModel:   data.vehicleModel,
      efficiencyWhKm: data.efficiencyWhKm,
      distanceKm:     data.distanceKm   ?? null,
      temperatureC:   data.temperatureC ?? null,
      routeType:      data.routeType    ?? "mixed",
    },
  });
  return { id: row.id };
}

async function getLeaderboard(limit = 10) {
  const rows = await prisma.efficiencyReport.groupBy({
    by:       ["vehicleModel"],
    _min:     { efficiencyWhKm: true },
    _count:   { vehicleModel: true },
    _avg:     { distanceKm: true },
    _max:     { createdAt: true },
    orderBy:  { _min: { efficiencyWhKm: "asc" } },
    take:     limit,
  });

  return rows
    .filter((r) => r._min.efficiencyWhKm !== null)
    .map((r, i) => ({
      rank:          i + 1,
      vehicleModel:  r.vehicleModel,
      bestWhKm:      Math.round(r._min.efficiencyWhKm!),
      bestKwh100km:  +(r._min.efficiencyWhKm! / 10).toFixed(1),
      reportCount:   r._count.vehicleModel,
      avgDistanceKm: r._avg.distanceKm ? Math.round(r._avg.distanceKm) : null,
      latest:        r._max.createdAt ?? new Date(),
    }));
}

// ─── Range Feedback ───────────────────────────────────────────────────────────

async function createRangeFeedback(data: {
  evSlug: string; predictedRangeKm?: number; actualRangeKm?: number;
  feedback: "accurate" | "over_estimated" | "under_estimated"; conditions?: string;
}) {
  const row = await prisma.rangeFeedback.create({
    data: {
      evSlug:           data.evSlug,
      predictedRangeKm: data.predictedRangeKm ?? null,
      actualRangeKm:    data.actualRangeKm    ?? null,
      feedback:         data.feedback,
      conditions:       data.conditions       ?? null,
    },
  });
  return { id: row.id };
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface CommunityStats {
  totalSessions:          number;
  totalTrips:             number;
  totalEfficiencyReports: number;
  totalStationReports:    number;
  avgEfficiencyWhKm:      number | null;
  avgCostPer100km:        number | null;
  petrolCostPer100km:     number;
  evSavingsPct:           number | null;
  topContributors:        { vehicleModel: string; count: number }[];
  recentActivity:         { type: string; vehicleModel?: string; text: string; time: string }[];
}

async function getStats(): Promise<CommunityStats> {
  const [sessions, trips, effRep, stRep] = await Promise.all([
    prisma.communitySession.count(),
    prisma.tripLog.count(),
    prisma.efficiencyReport.count(),
    prisma.stationReport.count(),
  ]);

  // Average efficiency (sanity-filtered)
  const effAgg = await prisma.efficiencyReport.aggregate({
    _avg: { efficiencyWhKm: true },
    where: { efficiencyWhKm: { gt: 50, lt: 400 } },
  });
  const avgEff = effAgg._avg.efficiencyWhKm
    ? Math.round(effAgg._avg.efficiencyWhKm)
    : null;

  // Cost calculations
  const avgEff100     = avgEff ?? 180;
  const evCost100     = Math.round((avgEff100 / 10) * ELECTRICITY_RATE_PKR);
  const petrolCost100 = Math.round(PETROL_L_PER_100KM * PETROL_PRICE_PKR);
  const savings       = Math.round(((petrolCost100 - evCost100) / petrolCost100) * 100);

  // Top contributors — aggregate both tables, merge in JS
  const [effTop, tripTop] = await Promise.all([
    prisma.efficiencyReport.groupBy({
      by: ["vehicleModel"], _count: { vehicleModel: true },
      orderBy: { _count: { vehicleModel: "desc" } }, take: 5,
    }),
    prisma.tripLog.groupBy({
      by: ["vehicleModel"], _count: { vehicleModel: true },
      orderBy: { _count: { vehicleModel: "desc" } }, take: 5,
    }),
  ]);
  const combined = new Map<string, number>();
  for (const r of [...effTop, ...tripTop]) {
    combined.set(r.vehicleModel, (combined.get(r.vehicleModel) ?? 0) + r._count.vehicleModel);
  }
  const topContributors = Array.from(combined.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([vehicleModel, count]) => ({ vehicleModel, count }));

  // Recent activity
  const [recentEff, recentTrips] = await Promise.all([
    prisma.efficiencyReport.findMany({
      orderBy: { createdAt: "desc" }, take: 5,
      select: { vehicleModel: true, efficiencyWhKm: true, createdAt: true },
    }),
    prisma.tripLog.findMany({
      orderBy: { createdAt: "desc" }, take: 5,
      select: { vehicleModel: true, distanceKm: true, createdAt: true },
    }),
  ]);

  const allRecent = [
    ...recentEff.map((r) => ({
      type: "efficiency", vehicleModel: r.vehicleModel,
      text: `${+(r.efficiencyWhKm / 10).toFixed(1)} kWh/100km`,
      time: r.createdAt.toISOString(),
    })),
    ...recentTrips.map((r) => ({
      type: "trip", vehicleModel: r.vehicleModel,
      text: `${Math.round(r.distanceKm)} km driven`,
      time: r.createdAt.toISOString(),
    })),
  ].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 8);

  return {
    totalSessions: sessions, totalTrips: trips,
    totalEfficiencyReports: effRep, totalStationReports: stRep,
    avgEfficiencyWhKm: avgEff, avgCostPer100km: evCost100,
    petrolCostPer100km: petrolCost100,
    evSavingsPct: avgEff ? savings : null,
    topContributors,
    recentActivity: allRecent,
  };
}

async function getReliabilityBoard() {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Group by stationId to get counts per status
  const rows = await prisma.stationReport.groupBy({
    by:     ["stationId", "stationName", "status"],
    where:  { createdAt: { gt: cutoff } },
    _count: { status: true },
  });

  // Aggregate in JS: combine status counts per station
  const stationMap = new Map<string, {
    stationId: string; stationName: string | null;
    avail: number; busy: number; broken: number; total: number;
  }>();

  for (const r of rows) {
    const entry = stationMap.get(r.stationId) ?? {
      stationId: r.stationId, stationName: r.stationName ?? null,
      avail: 0, busy: 0, broken: 0, total: 0,
    };
    const n = r._count.status;
    if (r.status === "available") entry.avail  += n;
    if (r.status === "busy")      entry.busy   += n;
    if (r.status === "broken")    entry.broken += n;
    entry.total += n;
    stationMap.set(r.stationId, entry);
  }

  return Array.from(stationMap.values())
    .filter((s) => s.total >= 2)
    .map((s) => ({
      stationId: s.stationId,
      name:      s.stationName ?? s.stationId,
      score:     Math.round(((s.avail + s.busy * 0.5) / s.total) * 100),
      available: s.avail, busy: s.busy, broken: s.broken, total: s.total,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const communityDb = {
  chargingSession:  { create: createChargingSession, getByToken: getSessionsByToken },
  stationReport:    { create: createStationReport,   getReliability: getStationReliability },
  tripLog:          { create: createTripLog,         getByToken: getTripsByToken },
  efficiencyReport: { create: createEfficiencyReport, getLeaderboard },
  rangeFeedback:    { create: createRangeFeedback },
  stats:            { get: getStats, getReliabilityBoard },
};
