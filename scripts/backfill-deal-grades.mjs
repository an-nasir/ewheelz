// scripts/backfill-deal-grades.mjs
// Backfills dealGrade on all ACTIVE listings that have null grade.
// Run: node scripts/backfill-deal-grades.mjs

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function calcDealGrade(price, avgMarketPrice, batteryHealth, mileage, year) {
  let score = 60;
  const currentYear = new Date().getFullYear();

  if (avgMarketPrice) {
    const diff = ((price - avgMarketPrice) / avgMarketPrice) * 100;
    if (diff < -10)     score += 15;
    else if (diff < 5)  score += 5;
    else if (diff > 15) score -= 20;
    else if (diff > 5)  score -= 8;
  }

  if (batteryHealth != null) {
    if (batteryHealth >= 90)      score += 15;
    else if (batteryHealth >= 80) score += 8;
    else if (batteryHealth < 70)  score -= 15;
  } else {
    score -= 10;
  }

  if (mileage != null) {
    if (mileage < 30_000)      score += 8;
    else if (mileage > 80_000) score -= 10;
  } else {
    score -= 5;
  }

  if (currentYear - year <= 1)      score += 5;
  else if (currentYear - year >= 4) score -= 5;

  score = Math.max(0, Math.min(100, score));

  if (score >= 75) return "HOT";
  if (score >= 55) return "GOOD";
  if (score >= 40) return "FAIR";
  return "OVERPRICED";
}

async function main() {
  // Build brand avg price map from all ACTIVE listings
  const all = await prisma.listing.findMany({
    where:  { status: "ACTIVE" },
    select: { id: true, price: true, year: true, mileage: true, batteryHealth: true, dealGrade: true, evName: true },
  });

  console.log(`Total ACTIVE listings: ${all.length}`);
  const ungraded = all.filter(l => !l.dealGrade);
  console.log(`Ungraded: ${ungraded.length}`);

  // Build brand avg map
  const byBrand = {};
  for (const l of all) {
    const brand = (l.evName ?? "").split(" ")[0];
    if (!brand) continue;
    byBrand[brand] = byBrand[brand] ?? [];
    byBrand[brand].push(l.price);
  }
  const brandAvg = {};
  for (const [b, prices] of Object.entries(byBrand)) {
    brandAvg[b] = Math.round(prices.reduce((a, c) => a + c, 0) / prices.length);
  }
  console.log(`Brands indexed: ${Object.keys(brandAvg).join(", ")}`);

  let updated = 0;
  for (const l of ungraded) {
    const brand  = (l.evName ?? "").split(" ")[0];
    const avg    = brandAvg[brand] ?? null;
    const grade  = calcDealGrade(l.price, avg, l.batteryHealth, l.mileage, l.year);
    await prisma.listing.update({ where: { id: l.id }, data: { dealGrade: grade } });
    updated++;
    if (updated % 50 === 0) console.log(`  ...${updated} backfilled`);
  }

  // Summary
  const grades = await prisma.listing.groupBy({
    by: ["dealGrade"],
    where: { status: "ACTIVE" },
    _count: { dealGrade: true },
  });
  console.log("\n── Grade distribution ──");
  for (const g of grades) {
    console.log(`  ${g.dealGrade ?? "null"}: ${g._count.dealGrade}`);
  }
  console.log(`\nDone — ${updated} listings backfilled.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
