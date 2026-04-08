// src/app/api/scraper/ingest/route.ts
// Receives scraped listings from the Python scraper, deduplicates + stores them.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcDealGrade } from "@/lib/dealGrade";

const SCRAPER_KEY = process.env.SCRAPER_KEY ?? "ewheelz-scraper-key-change-me";

interface ScrapedListing {
  title: string;
  price: string;
  location: string;
  date: string;
  source_url: string;
  source: string;
  images?: string[];              // image URLs from source
  image_url?: string;             // single image fallback
  // Pre-parsed by scraper (cleaner than regex on title)
  _year?: number;
  _mileage?: number;
  _brand?: string;
  _city?: string;
}

// ── Parsers ────────────────────────────────────────────────────────────────────

function parsePrice(raw: string): number | null {
  if (!raw) return null;
  const s = raw.toLowerCase().replace(/,/g, "").replace(/pkr/gi, "").trim();
  // "85 lac" or "85 lakh"
  const lacMatch = s.match(/([\d.]+)\s*la[ck]h?/i);
  if (lacMatch) return Math.round(parseFloat(lacMatch[1]) * 100_000);
  // "1.2 crore"
  const croreMatch = s.match(/([\d.]+)\s*crore/i);
  if (croreMatch) return Math.round(parseFloat(croreMatch[1]) * 10_000_000);
  // plain digits
  const digits = s.match(/[\d]+/g)?.join("") ?? "";
  const n = parseInt(digits, 10);
  return isNaN(n) || n < 100_000 ? null : n;
}

function parseYear(title: string): number | null {
  const m = title.match(/\b(20\d{2})\b/);
  return m ? parseInt(m[1], 10) : null;
}

function parseMileage(title: string): number | null {
  // "45,000 km" or "45000km"
  const m = title.match(/([\d,]+)\s*km/i);
  if (!m) return null;
  const n = parseInt(m[1].replace(/,/g, ""), 10);
  return isNaN(n) ? null : n;
}

function parseCity(location: string): string {
  // "Karachi, Sindh" → "Karachi"
  return (location || "").split(",")[0].trim() || "Unknown";
}

function parseEvName(title: string, brand?: string): string {
  let name = title
    .replace(/\b20\d{2}\b/, "")           // strip year
    .replace(/([\d,]+)\s*km/gi, "")        // strip mileage
    .replace(/for sale in .*/i, "")        // strip "for sale in Karachi"
    .replace(/\s+/g, " ")
    .trim();
  // If brand is known and name doesn't start with it, prepend
  if (brand && !name.toLowerCase().startsWith(brand.toLowerCase())) {
    name = `${brand} ${name}`.trim();
  }
  return name || brand || "Unknown EV";
}

// ── Route ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Auth
  const key = req.headers.get("x-scraper-key");
  if (key !== SCRAPER_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { listings: ScrapedListing[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { listings } = body;
  if (!Array.isArray(listings) || listings.length === 0) {
    return NextResponse.json({ error: "No listings" }, { status: 400 });
  }

  let created = 0, updated = 0, skipped = 0;
  const startTime = Date.now();
  console.log(`[ingest] START — ${listings.length} listings from scraper @ ${new Date().toISOString()}`);

  // Fetch brand avg prices once upfront for deal grading
  const brandPriceMap: Record<string, number> = {};
  const activePrices = await prisma.listing.findMany({
    where:  { status: "ACTIVE" },
    select: { price: true, evName: true },
    take:   500,
  });
  for (const l of activePrices) {
    const brand = (l.evName ?? "").split(" ")[0];
    if (!brand) continue;
    brandPriceMap[brand] = brandPriceMap[brand]
      ? Math.round((brandPriceMap[brand] + l.price) / 2)
      : l.price;
  }
  console.log(`[ingest] Brand avg map built — ${Object.keys(brandPriceMap).length} brands indexed`);

  for (const raw of listings) {
    if (!raw.source_url) { skipped++; continue; }

    const price   = parsePrice(raw.price);
    const year    = raw._year    ?? parseYear(raw.title);
    const mileage = raw._mileage ?? parseMileage(raw.title);
    const city    = raw._city    ?? parseCity(raw.location);
    const evName  = parseEvName(raw.title, raw._brand);

    if (!price || price < 500_000) {
      console.log(`[ingest] SKIP — invalid price "${raw.price}" for "${raw.title}"`);
      skipped++;
      continue;
    }

    const resolvedYear = year ?? new Date().getFullYear();
    const sourceName   = raw.source === "PakWheels" ? "PAKWHEELS" : "OLX";

    // Deal grade using brand avg
    const brandKey    = (raw._brand ?? evName.split(" ")[0]) || "";
    const avgPrice    = brandPriceMap[brandKey] ?? null;
    const dealGrade   = calcDealGrade(price, avgPrice, null, mileage ?? null, resolvedYear);

    // Collect images: prefer array, fall back to single URL
    const imgArr = raw.images?.length ? raw.images : raw.image_url ? [raw.image_url] : [];
    const imagesJson = imgArr.length > 0 ? JSON.stringify(imgArr) : null;

    const data = {
      evName,
      price,
      year:        resolvedYear,
      mileage:     mileage ?? null,
      city,
      condition:   "USED" as const,
      status:      "ACTIVE",
      source:      sourceName,
      sourceUrl:   raw.source_url,
      dealGrade,
      images:      imagesJson,
      description: raw.date ? `Listed on ${raw.source}: ${raw.date}` : `Scraped from ${raw.source}`,
    };

    try {
      const existing = await prisma.listing.findUnique({
        where: { sourceUrl: raw.source_url },
        select: { id: true, price: true, dealGrade: true, images: true },
      });

      if (existing) {
        const updates: Record<string, unknown> = {};
        if (existing.price !== price) updates.price = price;
        if (existing.dealGrade !== dealGrade) updates.dealGrade = dealGrade;
        if (imagesJson && !existing.images) updates.images = imagesJson;

        if (Object.keys(updates).length > 0) {
          await prisma.listing.update({ where: { id: existing.id }, data: updates });
          console.log(`[ingest] UPDATE — "${evName}" price=${price} grade=${dealGrade}`);
          updated++;
        } else {
          skipped++;
        }
      } else {
        await prisma.listing.create({ data });
        console.log(`[ingest] CREATE — "${evName}" PKR ${price.toLocaleString()} ${city} grade=${dealGrade}`);
        created++;
      }
    } catch (e) {
      console.error(`[ingest] ERROR — "${evName}" sourceUrl=${raw.source_url}`, e);
      skipped++;
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[ingest] DONE — created=${created} updated=${updated} skipped=${skipped} elapsed=${elapsed}s`);

  return NextResponse.json({ created, updated, skipped, total: listings.length, elapsedSeconds: parseFloat(elapsed) });
}
