#!/usr/bin/env node
// scripts/restore-snapshot.mjs
// Restores a JSON snapshot into any DB (SQLite dev or Neon PostgreSQL).
//
// Usage:
//   node scripts/restore-snapshot.mjs snapshot.json
//   DATABASE_URL="postgresql://..." node scripts/restore-snapshot.mjs snapshot.json
//
// Safe: upserts by id — running twice is idempotent.

import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

const file = process.argv[2];
if (!file) { console.error("Usage: node restore-snapshot.mjs <snapshot.json>"); process.exit(1); }

const snap = JSON.parse(readFileSync(file, "utf8"));
const db   = new PrismaClient();
const stats = {};

async function upsert(model, rows, key = "id", transform = r => r) {
  if (!Array.isArray(rows) || !rows.length) return;
  let ok = 0, skip = 0;
  for (const row of rows) {
    try {
      await db[model].upsert({
        where:  { [key]: row[key] },
        update: {},              // never overwrite — snapshot wins only on insert
        create: transform(row),
      });
      ok++;
    } catch { skip++; }
  }
  stats[model] = { ok, skip };
}

// ─── restore order respects FK deps ───────────────────────────────────────────

// 1. EV Models (no FKs)
await upsert("evModel", snap.evModels, "id", (r) => {
  const { specs, battery, charging, savedBy, affiliateLinks, priceHistory, reviews, listings, ...rest } = r;
  return rest;
});

// 2. EV Specs / Battery / Charging (FK → evModel)
for (const m of snap.evModels ?? []) {
  if (m.specs)    { try { await db.evSpec.upsert({ where: { id: m.specs.id }, update: {}, create: m.specs }); } catch {} }
  if (m.battery)  { try { await db.evBattery.upsert({ where: { id: m.battery.id }, update: {}, create: m.battery }); } catch {} }
  for (const c of m.charging ?? []) {
    try { await db.evCharging.upsert({ where: { id: c.id }, update: {}, create: c }); } catch {}
  }
}

// 3. Charging stations (no FKs)
await upsert("chargingStation", snap.chargingStations);

// 4. Articles (no FKs)
await upsert("article", snap.articles, "slug");

// 5. Listings (FK → evModel optional)
await upsert("listing", snap.listings, "id", (r) => {
  // sourceUrl unique — skip if collision is from the key field
  const { user, evModel, ...rest } = r;
  return { ...rest, userId: null, evModelId: rest.evModelId ?? null };
});

// 6. Leads / alerts / subscribers (no strong FKs)
await upsert("lead",                 snap.leads);
await upsert("priceAlert",           snap.priceAlerts);
await upsert("newsletterSubscriber", snap.subscribers, "email");
await upsert("affiliateLink",        snap.affiliateLinks);

await db.$disconnect();

console.log("✅ Restore complete:");
console.table(stats);
