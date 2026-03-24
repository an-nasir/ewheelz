/**
 * dev-server.mjs — Lightweight dev API server for eWheelz
 *
 * Serves all API routes using Node.js 22 built-in http + our SQLite shim.
 * Run: node --experimental-sqlite dev-server.mjs
 *
 * Use this for local API verification. The Next.js frontend (npm run dev)
 * requires the darwin SWC binary and works natively on macOS.
 */

import http from "node:http";
import { URL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

// ─── Load SQLite DB ────────────────────────────────────────────────────────────

import { DatabaseSync } from "node:sqlite";

const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
const dbPath = path.resolve(
  process.cwd(),
  dbUrl.replace("file:", "").replace("./", "")
);

const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function json(res, data, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(data, null, 2));
}

function err(res, msg, status = 400) {
  json(res, { error: msg }, status);
}

function mapModel(r) {
  return {
    id: r.id,
    brand: r.brand,
    model: r.model,
    variant: r.variant,
    slug: r.slug,
    year: r.year,
    powertrain: r.powertrain,
    bodyType: r.body_type,
    segment: r.segment,
    country: r.country,
    availableInPk: Boolean(r.available_in_pk),
    pricePkrMin: r.price_pkr_min,
    pricePkrMax: r.price_pkr_max,
    description: r.description,
  };
}

function mapSpec(r) {
  if (!r) return null;
  return {
    rangeWltp: r.range_wltp,
    rangeRealWorld: r.range_real_world,
    batteryCapKwh: r.battery_capacity_kwh,
    motorPowerKw: r.motor_power_kw,
    chargingDcKw: r.charging_dc_kw,
    chargingAcKw: r.charging_ac_kw,
    driveType: r.drive_type,
    accel0100: r.acceleration_0_100,
    topSpeed: r.top_speed,
    efficiencyWhKm: r.efficiency_wh_km,
    weight: r.weight,
    platform: r.platform,
    combinedRange: r.combined_range,
  };
}

function mapBattery(r) {
  if (!r) return null;
  return {
    chemistry: r.chemistry,
    capacityKwh: r.capacity_kwh,
    voltage: r.voltage,
    warrantyYears: r.warranty_years,
    cycleLife: r.cycle_life,
    thermalManagement: r.thermal_management,
  };
}

// ─── Route Handlers ───────────────────────────────────────────────────────────

function handleEvModels(req, res, sp) {
  const brand = sp.get("brand");
  const powertrain = sp.get("powertrain");
  const segment = sp.get("segment");
  const availableInPk = sp.get("available_in_pk");
  const sort = sp.get("sort") || "brand";

  let q = "SELECT * FROM ev_models WHERE 1=1";
  const params = [];
  if (brand) { q += " AND brand = ?"; params.push(brand); }
  if (powertrain) { q += " AND powertrain = ?"; params.push(powertrain); }
  if (segment) { q += " AND segment = ?"; params.push(segment); }
  if (availableInPk === "true") { q += " AND available_in_pk = 1"; }

  const sortMap = { brand: "brand ASC", price: "price_pkr_min ASC", year: "year DESC" };
  q += ` ORDER BY ${sortMap[sort] || "brand ASC"}`;

  const models = db.prepare(q).all(...params).map((r) => {
    const m = mapModel(r);
    const spec = db.prepare("SELECT * FROM ev_specs WHERE ev_model_id = ?").get(r.id);
    const bat = db.prepare("SELECT * FROM ev_batteries WHERE ev_model_id = ?").get(r.id);
    const listingCount = db.prepare("SELECT COUNT(*) as n FROM listings WHERE ev_model_id = ?").get(r.id);
    const reviewCount = db.prepare("SELECT COUNT(*) as n FROM reviews WHERE ev_model_id = ?").get(r.id);
    return {
      ...m,
      specs: mapSpec(spec),
      battery: bat ? { chemistry: bat.chemistry, capacityKwh: bat.capacity_kwh } : null,
      _count: { listings: listingCount.n, reviews: reviewCount.n },
    };
  });

  json(res, { count: models.length, data: models });
}

function handleEvModelBySlug(req, res, slug) {
  const r = db.prepare("SELECT * FROM ev_models WHERE slug = ?").get(slug);
  if (!r) return err(res, "Not found", 404);

  const spec = db.prepare("SELECT * FROM ev_specs WHERE ev_model_id = ?").get(r.id);
  const bat = db.prepare("SELECT * FROM ev_batteries WHERE ev_model_id = ?").get(r.id);
  const charging = db.prepare("SELECT * FROM ev_charging WHERE ev_model_id = ?").all(r.id);
  const reviews = db.prepare("SELECT r.*, u.name as author_name FROM reviews r JOIN users u ON r.author_id = u.id WHERE r.ev_model_id = ? ORDER BY r.created_at DESC").all(r.id);

  json(res, {
    ...mapModel(r),
    specs: mapSpec(spec),
    battery: mapBattery(bat),
    charging: charging.map((c) => ({
      connectorType: c.connector_type,
      maxDcKw: c.max_dc_kw,
      maxAcKw: c.max_ac_kw,
      chargingStandard: c.charging_standard,
    })),
    reviews: reviews.map((rv) => ({
      id: rv.id, rating: rv.rating, pros: rv.pros, cons: rv.cons,
      reviewText: rv.review_text, createdAt: rv.created_at,
      author: { name: rv.author_name },
    })),
  });
}

function handleCompare(req, res, sp) {
  const slugsParam = sp.get("slugs");
  if (!slugsParam) return err(res, "Provide ?slugs=slug1,slug2");
  const slugs = slugsParam.split(",").map((s) => s.trim()).slice(0, 4);
  if (slugs.length < 2) return err(res, "Provide at least 2 slugs");

  const models = slugs.map((slug) => {
    const r = db.prepare("SELECT * FROM ev_models WHERE slug = ?").get(slug);
    if (!r) return null;
    const spec = db.prepare("SELECT * FROM ev_specs WHERE ev_model_id = ?").get(r.id);
    const bat = db.prepare("SELECT * FROM ev_batteries WHERE ev_model_id = ?").get(r.id);
    return { ...mapModel(r), specs: mapSpec(spec), battery: mapBattery(bat) };
  }).filter(Boolean);

  if (models.length < 2) return err(res, "One or more models not found", 404);

  const highlights = {};
  const ranges = models.map((m) => m.specs?.rangeWltp).filter(Boolean);
  if (ranges.length) {
    const best = Math.max(...ranges);
    highlights.bestRange = models.find((m) => m.specs?.rangeWltp === best)?.slug;
  }
  const dcKws = models.map((m) => m.specs?.chargingDcKw).filter(Boolean);
  if (dcKws.length) {
    const fastest = Math.max(...dcKws);
    highlights.fastestCharging = models.find((m) => m.specs?.chargingDcKw === fastest)?.slug;
  }
  const accels = models.map((m) => m.specs?.accel0100).filter(Boolean);
  if (accels.length) {
    const quickest = Math.min(...accels);
    highlights.quickestAcceleration = models.find((m) => m.specs?.accel0100 === quickest)?.slug;
  }
  const prices = models.map((m) => m.pricePkrMin).filter(Boolean);
  if (prices.length) {
    const cheapest = Math.min(...prices);
    highlights.bestValue = models.find((m) => m.pricePkrMin === cheapest)?.slug;
  }

  json(res, { count: models.length, models, highlights });
}

function handleBatteries(req, res, sp) {
  const chemistry = sp.get("chemistry");
  let q = "SELECT b.*, m.brand, m.model, m.slug, m.price_pkr_min FROM ev_batteries b JOIN ev_models m ON b.ev_model_id = m.id";
  const params = [];
  if (chemistry) { q += " WHERE b.chemistry LIKE ?"; params.push(`%${chemistry}%`); }
  q += " ORDER BY b.capacity_kwh DESC";

  const rows = db.prepare(q).all(...params).map((r) => ({
    id: r.id, chemistry: r.chemistry, capacityKwh: r.capacity_kwh,
    voltage: r.voltage, cellFormat: r.cell_format,
    thermalManagement: r.thermal_management, warrantyYears: r.warranty_years,
    cycleLife: r.cycle_life, fastChargeCycles: r.fast_charge_cycles,
    degradationRate: r.degradation_rate,
    evModel: { brand: r.brand, model: r.model, slug: r.slug, pricePkrMin: r.price_pkr_min },
  }));

  json(res, { count: rows.length, data: rows });
}

function handleListings(req, res, sp) {
  const city = sp.get("city");
  const brand = sp.get("brand");
  const minPrice = sp.get("min_price");
  const maxPrice = sp.get("max_price");
  const condition = sp.get("condition");
  const page = parseInt(sp.get("page") || "1");
  const limit = parseInt(sp.get("limit") || "20");
  const offset = (page - 1) * limit;

  let q = "SELECT l.*, m.brand, m.model, m.slug FROM listings l JOIN ev_models m ON l.ev_model_id = m.id WHERE l.status = 'ACTIVE'";
  const params = [];
  if (city) { q += " AND l.city = ?"; params.push(city); }
  if (brand) { q += " AND m.brand = ?"; params.push(brand); }
  if (minPrice) { q += " AND l.price >= ?"; params.push(parseInt(minPrice)); }
  if (maxPrice) { q += " AND l.price <= ?"; params.push(parseInt(maxPrice)); }
  if (condition) { q += " AND l.condition = ?"; params.push(condition); }
  q += " ORDER BY l.created_at DESC";

  const countRow = db.prepare(q.replace("SELECT l.*, m.brand, m.model, m.slug", "SELECT COUNT(*) as n")).get(...params);
  q += ` LIMIT ${limit} OFFSET ${offset}`;
  const rows = db.prepare(q).all(...params).map((r) => ({
    id: r.id, price: r.price, year: r.year, mileage: r.mileage,
    city: r.city, batteryHealth: r.battery_health, condition: r.condition,
    description: r.description, createdAt: r.created_at,
    evModel: { brand: r.brand, model: r.model, slug: r.slug },
  }));

  json(res, { total: countRow.n, page, limit, data: rows });
}

function handleChargingStations(req, res, sp) {
  const city = sp.get("city");
  const network = sp.get("network");
  const connector = sp.get("connector");

  let q = "SELECT * FROM charging_stations WHERE 1=1";
  const params = [];
  if (city) { q += " AND city = ?"; params.push(city); }
  if (network) { q += " AND network = ?"; params.push(network); }
  if (connector) { q += " AND connector_types LIKE ?"; params.push(`%${connector}%`); }
  q += " ORDER BY name ASC";

  const rows = db.prepare(q).all(...params).map((r) => ({
    id: r.id, name: r.name, latitude: r.latitude, longitude: r.longitude,
    network: r.network, connectorTypes: r.connector_types?.split(",") || [],
    maxPowerKw: r.max_power_kw, city: r.city, country: r.country,
  }));

  json(res, { count: rows.length, data: rows });
}

function handleHealth(req, res) {
  const counts = {
    evModels: db.prepare("SELECT COUNT(*) as n FROM ev_models").get().n,
    listings: db.prepare("SELECT COUNT(*) as n FROM listings").get().n,
    chargingStations: db.prepare("SELECT COUNT(*) as n FROM charging_stations").get().n,
    reviews: db.prepare("SELECT COUNT(*) as n FROM reviews").get().n,
    articles: db.prepare("SELECT COUNT(*) as n FROM articles").get().n,
    users: db.prepare("SELECT COUNT(*) as n FROM users").get().n,
  };
  json(res, { status: "ok", db: "sqlite", counts });
}

// ─── HTTP Router ──────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  const sp = url.searchParams;

  if (req.method === "OPTIONS") {
    res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST", "Access-Control-Allow-Headers": "Content-Type" });
    return res.end();
  }

  try {
    if (pathname === "/health" || pathname === "/api/health") return handleHealth(req, res);
    if (pathname === "/api/ev-models" && req.method === "GET") return handleEvModels(req, res, sp);
    if (pathname.startsWith("/api/ev-models/") && req.method === "GET") {
      const slug = pathname.replace("/api/ev-models/", "");
      return handleEvModelBySlug(req, res, slug);
    }
    if (pathname === "/api/compare" && req.method === "GET") return handleCompare(req, res, sp);
    if (pathname === "/api/batteries" && req.method === "GET") return handleBatteries(req, res, sp);
    if (pathname === "/api/listings" && req.method === "GET") return handleListings(req, res, sp);
    if (pathname === "/api/charging-stations" && req.method === "GET") return handleChargingStations(req, res, sp);

    err(res, `Unknown route: ${pathname}`, 404);
  } catch (e) {
    console.error(e);
    err(res, e.message, 500);
  }
});

server.listen(PORT, () => {
  console.log(`\n  eWheelz Dev API Server`);
  console.log(`  Local: http://localhost:${PORT}\n`);
  console.log(`  Endpoints:`);
  console.log(`    GET /health`);
  console.log(`    GET /api/ev-models`);
  console.log(`    GET /api/ev-models/:slug`);
  console.log(`    GET /api/compare?slugs=byd-atto-3,mg-zs-ev`);
  console.log(`    GET /api/batteries`);
  console.log(`    GET /api/listings`);
  console.log(`    GET /api/charging-stations\n`);
});
