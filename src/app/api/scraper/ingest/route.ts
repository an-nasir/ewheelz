// src/app/api/scraper/ingest/route.ts
// Receives scraped listings from the Python scraper, deduplicates + stores them.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SCRAPER_KEY = process.env.SCRAPER_KEY ?? "ewheelz-scraper-key-change-me";

interface ScrapedListing {
  title: string;
  price: string;
  location: string;
  date: string;
  source_url: string;
  source: string;
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

function parseEvName(title: string): string {
  // Remove year and mileage from title to get clean EV name
  return title
    .replace(/\b20\d{2}\b/, "")
    .replace(/([\d,]+)\s*km/gi, "")
    .replace(/\s+/g, " ")
    .trim();
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

  for (const raw of listings) {
    if (!raw.source_url) { skipped++; continue; }

    const price   = parsePrice(raw.price);
    const year    = raw._year    ?? parseYear(raw.title);
    const mileage = raw._mileage ?? parseMileage(raw.title);
    const city    = raw._city    ?? parseCity(raw.location);
    const evName  = parseEvName(raw.title);

    if (!price || price < 500_000) { skipped++; continue; }

    const data = {
      evName,
      price,
      year:    year   ?? new Date().getFullYear(),
      mileage: mileage ?? null,
      city,
      status:    "ACTIVE",
      source:    raw.source === "PakWheels" ? "PAKWHEELS" : "OLX",
      sourceUrl: raw.source_url,
      description: `Scraped ${raw.date ?? ""}`.trim(),
    };

    try {
      const existing = await prisma.listing.findUnique({
        where: { sourceUrl: raw.source_url },
      });

      if (existing) {
        // Update price only if changed (price can shift on PakWheels)
        if (existing.price !== price) {
          await prisma.listing.update({ where: { id: existing.id }, data: { price } });
          updated++;
        } else {
          skipped++;
        }
      } else {
        await prisma.listing.create({ data });
        created++;
      }
    } catch (e) {
      console.error("Listing upsert failed:", e);
      skipped++;
    }
  }

  return NextResponse.json({ created, updated, skipped, total: listings.length });
}
