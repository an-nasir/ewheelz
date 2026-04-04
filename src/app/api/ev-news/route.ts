// src/app/api/ev-news/route.ts
// Aggregates EV news from Pakistani & international RSS feeds
// Cached for 1 hour — no API key required

import { NextResponse } from "next/server";

const FEEDS = [
  // Pakistani news — EV/auto sections
  { source: "Dawn",            url: "https://www.dawn.com/feeds/home", country: "🇵🇰" },
  { source: "The News",        url: "https://www.thenews.com.pk/rss/1/7", country: "🇵🇰" },
  { source: "Business Recorder", url: "https://www.brecorder.com/feed", country: "🇵🇰" },
  { source: "Profit Pakistan", url: "https://profit.pakistantoday.com.pk/feed/", country: "🇵🇰" },
  // International EV-focused
  { source: "Electrek",        url: "https://electrek.co/feed/", country: "🌍" },
  { source: "InsideEVs",       url: "https://insideevs.com/rss/articles/", country: "🌍" },
];

const EV_KEYWORDS = [
  "electric", "EV", "BYD", "Tesla", "MG ZS", "Hyundai IONIQ", "battery",
  "charging", "hybrid", "PHEV", "e-car", "electric car", "electric vehicle",
  "Deepal", "Changan", "Xpeng", "NIO", "electric bike", "EVSE",
];

function isEVRelated(text: string): boolean {
  const lower = text.toLowerCase();
  return EV_KEYWORDS.some(k => lower.includes(k.toLowerCase()));
}

function extractItems(xml: string, source: string, country: string) {
  const items: { title: string; link: string; pubDate: string; source: string; country: string; excerpt: string }[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title   = (/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/.exec(block) ?? /<title>([\s\S]*?)<\/title>/.exec(block))?.[1]?.trim() ?? "";
    const link    = (/<link>([\s\S]*?)<\/link>/.exec(block) ?? /<guid>([\s\S]*?)<\/guid>/.exec(block))?.[1]?.trim() ?? "";
    const pubDate = (/<pubDate>([\s\S]*?)<\/pubDate>/.exec(block))?.[1]?.trim() ?? "";
    const desc    = (/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/.exec(block) ?? /<description>([\s\S]*?)<\/description>/.exec(block))?.[1]?.trim() ?? "";
    const excerpt = desc.replace(/<[^>]+>/g, "").slice(0, 160).trim();

    if (title && (isEVRelated(title) || isEVRelated(desc))) {
      items.push({ title, link, pubDate, source, country, excerpt });
    }
  }
  return items;
}

let cache: { articles: any[]; ts: number } | null = null;

export async function GET() {
  // 1-hour cache
  if (cache && Date.now() - cache.ts < 60 * 60 * 1000) {
    return NextResponse.json(cache.articles, {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  }

  const results = await Promise.allSettled(
    FEEDS.map(async ({ source, url, country }) => {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(6000),
        headers: { "User-Agent": "eWheelz/1.0 (+https://ewheelz.pk)" },
      });
      const xml = await res.text();
      return extractItems(xml, source, country);
    })
  );

  const all = results
    .flatMap(r => r.status === "fulfilled" ? r.value : [])
    .sort((a, b) => new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime())
    .slice(0, 40);

  cache = { articles: all, ts: Date.now() };

  return NextResponse.json(all, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
