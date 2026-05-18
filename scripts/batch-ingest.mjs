#!/usr/bin/env node
// Batch insert scraped listings from JSON backup, bypassing the slow HTTP API route.

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dir = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
const envPath = path.join(__dir, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^"(.*)"$/, "$1");
    }
  });
}

const prisma = new PrismaClient();

const SCRAPER_JSON = process.argv[2] || path.join(__dir, "../data/scraped_2026-04-16.json");
const BATCH_SIZE = 50;  // upsert 50 at a time

async function calcDealGrade(price, avgPrice, _, mileage, year) {
  // Simplified: just copy from route logic
  if (!avgPrice) return "FAIR";
  const ratio = price / avgPrice;
  if (ratio < 0.8) return "HOT";
  if (ratio < 1.0) return "GOOD";
  if (ratio < 1.15) return "FAIR";
  return "OVERPRICED";
}

async function ingestBatch(listings) {
  const prismaOps = listings.map((raw) => {
    const price = parseInt((raw.price || "").toString().replace(/,/g, ""), 10) || 5000000;
    const year = (raw._year || new Date().getFullYear());
    const city = (raw._city || raw.location || "Unknown").split(",")[0].trim() || "Unknown";
    const evName = (raw._brand || "EV") + " " + (raw.title || "").replace(/\b20\d{2}\b/, "").trim();
    const images = raw.images?.length ? JSON.stringify(raw.images) : null;

    return prisma.listing.upsert({
      where: { sourceUrl: raw.source_url },
      update: {
        price,
        dealGrade: "FAIR", // simplified for now
        images: images || undefined,
      },
      create: {
        evName: evName.slice(0, 100),
        price,
        year,
        city,
        mileage: raw._mileage || null,
        condition: "USED",
        status: "ACTIVE",
        source: "PAKWHEELS",
        sourceUrl: raw.source_url,
        dealGrade: "FAIR",
        images,
        description: `Scraped from PakWheels`,
      },
    });
  });

  return Promise.all(prismaOps);
}

async function main() {
  console.log(`📖 Reading ${SCRAPER_JSON}...`);
  const raw = JSON.parse(fs.readFileSync(SCRAPER_JSON, "utf8"));
  const listings = Array.isArray(raw) ? raw : raw.listings || [];

  console.log(`🚀 Batch ingesting ${listings.length} listings (batch size: ${BATCH_SIZE})...`);

  let created = 0,
    updated = 0,
    skipped = 0;
  const start = Date.now();

  for (let i = 0; i < listings.length; i += BATCH_SIZE) {
    const batch = listings.slice(i, i + BATCH_SIZE);
    try {
      const results = await ingestBatch(batch);
      // Count updates vs creates (rough: if price/images changed it was an update)
      created += results.length;
      console.log(`  ✅ Batch ${Math.ceil(i / BATCH_SIZE)} — ${results.length}/${batch.length} ops`);
    } catch (e) {
      console.error(`  ❌ Batch ${Math.ceil(i / BATCH_SIZE)} failed:`, e.message);
      skipped += batch.length;
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✨ Done in ${elapsed}s`);
  console.log(`   Created/Updated: ~${created}`);
  console.log(`   Skipped: ${skipped}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
