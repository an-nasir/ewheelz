// src/app/sitemap.ts
import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://ewheelz.pk";

const CITIES  = ["karachi","lahore","islamabad","rawalpindi","faisalabad","multan","peshawar"];
const BRANDS  = ["byd","mg","hyundai","changan","deepal","tesla","xpeng","kia"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}`,                  lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/listings`,         lastModified: now, changeFrequency: "hourly",  priority: 0.95 },
    { url: `${BASE}/ev`,               lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/compare`,          lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/battery-health`,   lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/ev-valuation`,     lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/charging-map`,     lastModified: now, changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE}/cost-calculator`,  lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/emi-calculator`,   lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/ev-range`,         lastModified: now, changeFrequency: "weekly",  priority: 0.75 },
    { url: `${BASE}/articles`,         lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/batteries`,        lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/contact`,          lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
  ];

  // Brand landing pages — "BYD price Pakistan", "MG ZS EV Pakistan"
  const brandPages: MetadataRoute.Sitemap = BRANDS.map(b => ({
    url: `${BASE}/brands/${b}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  // City-filtered listing pages
  const cityPages: MetadataRoute.Sitemap = CITIES.map(c => ({
    url: `${BASE}/listings?city=${c.charAt(0).toUpperCase() + c.slice(1)}`,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.85,
  }));

  let evPages: MetadataRoute.Sitemap = [];
  let articlePages: MetadataRoute.Sitemap = [];
  let listingPages: MetadataRoute.Sitemap = [];

  try {
    const [evs, articles, listings] = await Promise.all([
      prisma.evModel.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.article.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
      prisma.listing.findMany({ where: { status: "ACTIVE" } as any, select: { id: true, updatedAt: true }, orderBy: { createdAt: "desc" } }),
    ]);

    evPages = evs.map(ev => ({
      url: `${BASE}/ev/${ev.slug}`,
      lastModified: ev.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    articlePages = articles.map(a => ({
      url: `${BASE}/articles/${a.slug}`,
      lastModified: a.updatedAt ?? now,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }));

    // Individual listing pages — each is a unique indexed URL
    listingPages = listings.map(l => ({
      url: `${BASE}/en/listings/${l.id}`,
      lastModified: l.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));
  } catch { /* DB unavailable at build time — skip */ }

  return [...staticPages, ...brandPages, ...cityPages, ...evPages, ...articlePages, ...listingPages];
}
