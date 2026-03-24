// src/app/api/cron/ev-news-dump/route.ts
// POST /api/cron/ev-news-dump — Ingest EV news/specs from any scraper
//
// Usage:
//   curl -X POST https://ewheelz.vercel.app/api/cron/ev-news-dump \
//     -H "x-dump-secret: YOUR_SECRET" \
//     -H "Content-Type: application/json" \
//     -d '{"type":"article","items":[{"title":"...","content":"...","source":"reddit"}]}'
//
// Supported types:
//   "article"  — bulk insert articles (from Reddit, Dawn, PakWheels scraper etc.)
//   "ev_spec"  — update EV spec fields (from manufacturer pages, X/Twitter)
//   "station"  — upsert charging stations (from any source)
//
// You can build a scraper in Python/Node and POST here.
// No live scraping happens here — this is the RECEIVER endpoint.

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DUMP_SECRET = process.env.DUMP_SECRET ?? process.env.SEED_SECRET ?? "ewheelz-seed-2025";

interface ArticleItem {
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  source?: string;  // "reddit" | "x_twitter" | "dawn" | "pakwheels" | "manual"
  imageUrl?: string;
  publishedAt?: string;
}

interface EvSpecItem {
  slug: string;         // must match existing EV slug
  rangeRealWorld?: number;
  pricePkrMin?: number;
  pricePkrMax?: number;
  source?: string;      // where you scraped this from
}

interface StationItem {
  name: string;
  latitude: number;
  longitude: number;
  city?: string;
  network?: string;
  maxPowerKw?: number;
  connectorTypes?: string;
  liveStatus?: string;
  address?: string;
}

export async function POST(req: NextRequest) {
  // ─── Auth ─────────────────────────────────────────────────────────────
  const secret = req.headers.get("x-dump-secret") ?? new URL(req.url).searchParams.get("secret");
  if (secret !== DUMP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.type || !Array.isArray(body?.items)) {
    return NextResponse.json({
      error: "Invalid body. Expected: { type: 'article'|'ev_spec'|'station', items: [...] }",
    }, { status: 400 });
  }

  const { type, items } = body as { type: string; items: unknown[] };
  const results = { inserted: 0, updated: 0, skipped: 0, errors: 0 };

  // ─── Articles ──────────────────────────────────────────────────────────
  if (type === "article") {
    for (const raw of items as ArticleItem[]) {
      try {
        if (!raw.title || !raw.content) { results.skipped++; continue; }

        // Generate slug from title
        const slug = raw.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .slice(0, 80);

        const exists = await prisma.article.findUnique({ where: { slug } });
        if (exists) { results.skipped++; continue; }

        await prisma.article.create({
          data: {
            title:      raw.title,
            slug,
            content:    raw.content,
            excerpt:    raw.excerpt ?? raw.content.slice(0, 160),
            category:   (raw.category ?? "NEWS").toUpperCase(),
            imageUrl:   raw.imageUrl ?? null,
            published:  true,
            publishedAt: raw.publishedAt ? new Date(raw.publishedAt) : new Date(),
          },
        });
        results.inserted++;
      } catch { results.errors++; }
    }
  }

  // ─── EV Spec Updates ───────────────────────────────────────────────────
  else if (type === "ev_spec") {
    for (const raw of items as EvSpecItem[]) {
      try {
        if (!raw.slug) { results.skipped++; continue; }

        const ev = await prisma.evModel.findUnique({ where: { slug: raw.slug } });
        if (!ev) { results.skipped++; continue; }

        // Update price if provided
        const evUpdate: Record<string, number | null> = {};
        if (raw.pricePkrMin != null) evUpdate.pricePkrMin = raw.pricePkrMin;
        if (raw.pricePkrMax != null) evUpdate.pricePkrMax = raw.pricePkrMax;

        if (Object.keys(evUpdate).length > 0) {
          await prisma.evModel.update({ where: { slug: raw.slug }, data: evUpdate });
        }

        // Update real-world range in specs
        if (raw.rangeRealWorld != null) {
          await prisma.evSpec.updateMany({
            where: { evModelId: ev.id },
            data:  { rangeRealWorld: raw.rangeRealWorld },
          });
        }

        results.updated++;
      } catch { results.errors++; }
    }
  }

  // ─── Charging Stations ─────────────────────────────────────────────────
  else if (type === "station") {
    for (const raw of items as StationItem[]) {
      try {
        if (!raw.name || !raw.latitude || !raw.longitude) { results.skipped++; continue; }

        const existing = await prisma.chargingStation.findFirst({
          where: {
            latitude:  { gte: raw.latitude  - 0.0005, lte: raw.latitude  + 0.0005 },
            longitude: { gte: raw.longitude - 0.0005, lte: raw.longitude + 0.0005 },
          },
        });

        if (existing) {
          await prisma.chargingStation.update({
            where: { id: existing.id },
            data: {
              liveStatus:     raw.liveStatus ?? existing.liveStatus,
              connectorTypes: raw.connectorTypes ?? existing.connectorTypes,
              maxPowerKw:     raw.maxPowerKw ?? existing.maxPowerKw,
            },
          });
          results.updated++;
        } else {
          await prisma.chargingStation.create({
            data: {
              name:          raw.name,
              latitude:      raw.latitude,
              longitude:     raw.longitude,
              city:          raw.city ?? "Pakistan",
              country:       "Pakistan",
              network:       raw.network ?? null,
              maxPowerKw:    raw.maxPowerKw ?? null,
              connectorTypes: raw.connectorTypes ?? "CCS2",
              liveStatus:    raw.liveStatus ?? "OPERATIONAL",
              address:       raw.address ?? null,
            },
          });
          results.inserted++;
        }
      } catch { results.errors++; }
    }
  }

  else {
    return NextResponse.json({ error: `Unknown type: ${type}. Use 'article', 'ev_spec', or 'station'.` }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    type,
    processedAt: new Date().toISOString(),
    results,
  });
}

// ─── GET: show usage docs ────────────────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/cron/ev-news-dump",
    method:   "POST",
    auth:     "Header: x-dump-secret: YOUR_DUMP_SECRET",
    types: {
      article: {
        description: "Bulk insert articles from Reddit, X, Dawn, PakWheels scrapers",
        example: {
          type: "article",
          items: [{ title: "BYD announces...", content: "Full text...", source: "reddit", category: "NEWS" }],
        },
      },
      ev_spec: {
        description: "Update EV specs/prices from manufacturer pages or X/Twitter",
        example: {
          type: "ev_spec",
          items: [{ slug: "byd-atto-3", rangeRealWorld: 405, pricePkrMin: 8800000, source: "byd.com.pk" }],
        },
      },
      station: {
        description: "Upsert charging stations from any source (NEPRA, NTDC, manual)",
        example: {
          type: "station",
          items: [{ name: "New PSO Station", latitude: 31.5, longitude: 74.3, city: "Lahore", maxPowerKw: 100 }],
        },
      },
    },
    tip: "Build a Python/Node scraper and POST here nightly. No scraping logic runs on this server.",
  });
}
