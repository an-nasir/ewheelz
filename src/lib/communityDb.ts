// src/lib/communityDb.ts — Anonymous community data via node:sqlite (Node 22)
// No user accounts required. All data is anonymised by session token.

import { DatabaseSync } from "node:sqlite";
import path from "path";
import crypto from "crypto";

// ─── Database ─────────────────────────────────────────────────────────────────

const DB_PATH = path.join(process.cwd(), "prisma", "dev.db");
let _db: DatabaseSync | null = null;

function db(): DatabaseSync {
  if (!_db) {
    _db = new DatabaseSync(DB_PATH);
    initCommunitySchema();
  }
  return _db;
}

function initCommunitySchema(): void {
  _db!.exec(`
    CREATE TABLE IF NOT EXISTS community_sessions (
      id TEXT PRIMARY KEY,
      session_token TEXT NOT NULL,
      vehicle_model TEXT NOT NULL,
      station_name TEXT,
      start_battery_pct REAL,
      end_battery_pct REAL,
      kwh_added REAL,
      cost_pkr REAL,
      charging_time_min INTEGER,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_cs_token ON community_sessions(session_token);

    CREATE TABLE IF NOT EXISTS station_reports (
      id TEXT PRIMARY KEY,
      station_id TEXT NOT NULL,
      station_name TEXT,
      status TEXT NOT NULL,
      queue_length INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sr_station ON station_reports(station_id);
    CREATE INDEX IF NOT EXISTS idx_sr_created ON station_reports(created_at);

    CREATE TABLE IF NOT EXISTS trip_logs (
      id TEXT PRIMARY KEY,
      session_token TEXT NOT NULL,
      vehicle_model TEXT NOT NULL,
      distance_km REAL NOT NULL,
      battery_used_pct REAL,
      avg_speed_kmh REAL,
      temperature_c REAL,
      ac_on INTEGER NOT NULL DEFAULT 0,
      kwh_used REAL,
      efficiency_wh_km REAL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_tl_token ON trip_logs(session_token);

    CREATE TABLE IF NOT EXISTS efficiency_reports (
      id TEXT PRIMARY KEY,
      session_token TEXT NOT NULL,
      vehicle_model TEXT NOT NULL,
      efficiency_wh_km REAL NOT NULL,
      distance_km REAL,
      temperature_c REAL,
      route_type TEXT NOT NULL DEFAULT 'mixed',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_er_model ON efficiency_reports(vehicle_model);
    CREATE INDEX IF NOT EXISTS idx_er_token ON efficiency_reports(session_token);

    CREATE TABLE IF NOT EXISTS range_feedback (
      id TEXT PRIMARY KEY,
      ev_slug TEXT NOT NULL,
      predicted_range_km REAL,
      actual_range_km REAL,
      feedback TEXT NOT NULL,
      conditions TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rf_slug ON range_feedback(ev_slug);
  `);
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ELECTRICITY_RATE_PKR = 35;  // PKR per kWh
const PETROL_PRICE_PKR     = 310; // PKR per litre
const PETROL_L_PER_100KM   = 12;  // avg sedan

function now(): string { return new Date().toISOString(); }
function uid(): string  { return crypto.randomUUID(); }

// ─── Charging Sessions ────────────────────────────────────────────────────────

async function createChargingSession(data: {
  sessionToken: string; vehicleModel: string; stationName?: string;
  startBatteryPct?: number; endBatteryPct?: number; kwhAdded?: number;
  costPkr?: number; chargingTimeMin?: number;
}) {
  const id = uid();
  db().prepare(
    `INSERT INTO community_sessions
     (id,session_token,vehicle_model,station_name,start_battery_pct,end_battery_pct,kwh_added,cost_pkr,charging_time_min,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id, data.sessionToken, data.vehicleModel,
    data.stationName ?? null, data.startBatteryPct ?? null,
    data.endBatteryPct ?? null, data.kwhAdded ?? null,
    data.costPkr ?? null, data.chargingTimeMin ?? null, now()
  );
  return { id };
}

// ─── Station Reports ──────────────────────────────────────────────────────────

async function createStationReport(data: {
  stationId: string; stationName?: string;
  status: "available" | "busy" | "broken"; queueLength?: number;
}) {
  const id = uid();
  db().prepare(
    `INSERT INTO station_reports (id,station_id,station_name,status,queue_length,created_at)
     VALUES (?,?,?,?,?,?)`
  ).run(id, data.stationId, data.stationName ?? null, data.status, data.queueLength ?? 0, now());
  return { id };
}

async function getStationReliability(stationId: string) {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const rows = db().prepare(
    `SELECT status, COUNT(*) AS n FROM station_reports
     WHERE station_id = ? AND created_at > ? GROUP BY status`
  ).all(stationId, cutoff) as { status: string; n: number }[];

  const counts = { available: 0, busy: 0, broken: 0 };
  let total = 0;
  for (const r of rows) {
    const n = Number(r.n);
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
  const id = uid();
  db().prepare(
    `INSERT INTO trip_logs
     (id,session_token,vehicle_model,distance_km,battery_used_pct,avg_speed_kmh,temperature_c,ac_on,kwh_used,efficiency_wh_km,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id, data.sessionToken, data.vehicleModel, data.distanceKm,
    data.batteryUsedPct ?? null, data.avgSpeedKmh ?? null,
    data.temperatureC ?? null, data.acOn ? 1 : 0,
    data.kwhUsed ?? null, eff, now()
  );
  return { id };
}

// ─── Efficiency Reports ───────────────────────────────────────────────────────

async function createEfficiencyReport(data: {
  sessionToken: string; vehicleModel: string; efficiencyWhKm: number;
  distanceKm?: number; temperatureC?: number; routeType?: string;
}) {
  const id = uid();
  db().prepare(
    `INSERT INTO efficiency_reports
     (id,session_token,vehicle_model,efficiency_wh_km,distance_km,temperature_c,route_type,created_at)
     VALUES (?,?,?,?,?,?,?,?)`
  ).run(
    id, data.sessionToken, data.vehicleModel, data.efficiencyWhKm,
    data.distanceKm ?? null, data.temperatureC ?? null,
    data.routeType ?? "mixed", now()
  );
  return { id };
}

async function getLeaderboard(limit = 10) {
  const rows = db().prepare(
    `SELECT vehicle_model,
            MIN(efficiency_wh_km) AS best_wh_km,
            COUNT(*)              AS report_count,
            AVG(distance_km)      AS avg_distance,
            MAX(created_at)       AS latest
     FROM efficiency_reports
     GROUP BY vehicle_model
     ORDER BY best_wh_km ASC
     LIMIT ?`
  ).all(limit) as {
    vehicle_model: string; best_wh_km: number;
    report_count: number; avg_distance: number | null; latest: string;
  }[];

  return rows.map((r, i) => ({
    rank:          i + 1,
    vehicleModel:  r.vehicle_model,
    bestWhKm:      Math.round(r.best_wh_km),
    bestKwh100km:  +(r.best_wh_km / 10).toFixed(1),
    reportCount:   Number(r.report_count),
    avgDistanceKm: r.avg_distance ? Math.round(r.avg_distance) : null,
    latest:        new Date(r.latest),
  }));
}

// ─── Range Feedback ───────────────────────────────────────────────────────────

async function createRangeFeedback(data: {
  evSlug: string; predictedRangeKm?: number; actualRangeKm?: number;
  feedback: "accurate" | "over_estimated" | "under_estimated"; conditions?: string;
}) {
  const id = uid();
  db().prepare(
    `INSERT INTO range_feedback (id,ev_slug,predicted_range_km,actual_range_km,feedback,conditions,created_at)
     VALUES (?,?,?,?,?,?,?)`
  ).run(
    id, data.evSlug, data.predictedRangeKm ?? null,
    data.actualRangeKm ?? null, data.feedback,
    data.conditions ?? null, now()
  );
  return { id };
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
  const count = (table: string): number =>
    Number((db().prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as Record<string,unknown>).n);

  const sessions  = count("community_sessions");
  const trips     = count("trip_logs");
  const effRep    = count("efficiency_reports");
  const stRep     = count("station_reports");

  // Average efficiency (sanity-filtered)
  const effRow = db().prepare(
    `SELECT AVG(efficiency_wh_km) AS avg FROM efficiency_reports
     WHERE efficiency_wh_km > 50 AND efficiency_wh_km < 400`
  ).get() as { avg: number | null };
  const avgEff = effRow.avg ? Math.round(effRow.avg) : null;

  // Cost calculations
  const avgEff100     = avgEff ?? 180;
  const evCost100     = Math.round((avgEff100 / 10) * ELECTRICITY_RATE_PKR);
  const petrolCost100 = Math.round(PETROL_L_PER_100KM * PETROL_PRICE_PKR);
  const savings       = Math.round(((petrolCost100 - evCost100) / petrolCost100) * 100);

  // Top contributors
  const topRows = db().prepare(
    `SELECT vehicle_model, COUNT(*) AS cnt
     FROM (
       SELECT vehicle_model FROM efficiency_reports
       UNION ALL
       SELECT vehicle_model FROM trip_logs
     )
     GROUP BY vehicle_model ORDER BY cnt DESC LIMIT 5`
  ).all() as { vehicle_model: string; cnt: number }[];

  // Recent activity
  const recentEff = db().prepare(
    `SELECT vehicle_model, efficiency_wh_km, created_at FROM efficiency_reports ORDER BY created_at DESC LIMIT 5`
  ).all() as { vehicle_model: string; efficiency_wh_km: number; created_at: string }[];

  const recentTrips = db().prepare(
    `SELECT vehicle_model, distance_km, created_at FROM trip_logs ORDER BY created_at DESC LIMIT 5`
  ).all() as { vehicle_model: string; distance_km: number; created_at: string }[];

  const allRecent = [
    ...recentEff.map((r) => ({
      type: "efficiency", vehicleModel: r.vehicle_model,
      text: `${+(r.efficiency_wh_km / 10).toFixed(1)} kWh/100km`, time: r.created_at,
    })),
    ...recentTrips.map((r) => ({
      type: "trip", vehicleModel: r.vehicle_model,
      text: `${Math.round(r.distance_km)} km driven`, time: r.created_at,
    })),
  ].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 8);

  return {
    totalSessions: sessions, totalTrips: trips,
    totalEfficiencyReports: effRep, totalStationReports: stRep,
    avgEfficiencyWhKm: avgEff, avgCostPer100km: evCost100,
    petrolCostPer100km: petrolCost100,
    evSavingsPct: avgEff ? savings : null,
    topContributors: topRows.map((r) => ({ vehicleModel: r.vehicle_model, count: Number(r.cnt) })),
    recentActivity: allRecent,
  };
}

async function getReliabilityBoard() {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const rows = db().prepare(
    `SELECT station_id, station_name,
            SUM(CASE WHEN status='available' THEN 1 ELSE 0 END) AS avail,
            SUM(CASE WHEN status='busy'      THEN 1 ELSE 0 END) AS busy,
            SUM(CASE WHEN status='broken'    THEN 1 ELSE 0 END) AS broken,
            COUNT(*) AS total
     FROM station_reports
     WHERE created_at > ?
     GROUP BY station_id, station_name
     HAVING COUNT(*) >= 2
     ORDER BY (SUM(CASE WHEN status='available' THEN 1 ELSE 0 END)
               + SUM(CASE WHEN status='busy' THEN 1 ELSE 0 END) * 0.5)
              * 1.0 / COUNT(*) DESC
     LIMIT 6`
  ).all(cutoff) as {
    station_id: string; station_name: string | null;
    avail: number; busy: number; broken: number; total: number;
  }[];

  return rows.map((r) => {
    const avail  = Number(r.avail);
    const busy   = Number(r.busy);
    const broken = Number(r.broken);
    const total  = Number(r.total);
    return {
      stationId: r.station_id, name: r.station_name ?? r.station_id,
      score: Math.round(((avail + busy * 0.5) / total) * 100),
      available: avail, busy, broken, total,
    };
  });
}

// ─── Dashboard queries ────────────────────────────────────────────────────────

async function getTripsByToken(sessionToken: string, limit = 50) {
  const rows = db().prepare(
    `SELECT vehicle_model, distance_km, battery_used_pct, kwh_used, created_at
     FROM trip_logs WHERE session_token = ? ORDER BY created_at DESC LIMIT ?`
  ).all(sessionToken, limit) as {
    vehicle_model: string; distance_km: number;
    battery_used_pct: number | null; kwh_used: number | null; created_at: string;
  }[];
  return rows.map((r) => ({
    vehicle_model: r.vehicle_model, distance_km: r.distance_km,
    battery_used_pct: r.battery_used_pct, kwh_used: r.kwh_used,
    created_at: r.created_at,
  }));
}

async function getSessionsByToken(sessionToken: string, limit = 50) {
  const rows = db().prepare(
    `SELECT vehicle_model, kwh_added, cost_pkr, charging_time_min, station_name, created_at
     FROM community_sessions WHERE session_token = ? ORDER BY created_at DESC LIMIT ?`
  ).all(sessionToken, limit) as {
    vehicle_model: string; kwh_added: number | null;
    cost_pkr: number | null; charging_time_min: number | null;
    station_name: string | null; created_at: string;
  }[];
  return rows.map((r) => ({
    vehicle_model: r.vehicle_model, kwh_added: r.kwh_added,
    cost_pkr: r.cost_pkr, charging_time_min: r.charging_time_min,
    station_name: r.station_name, created_at: r.created_at,
  }));
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
