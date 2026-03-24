// src/app/sitemap.ts — Auto-generated sitemap for eWheelz
import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = "https://ewheelz.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                       lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/ev`,               lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/compare`,          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/ev-range`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/charging-map`,     lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/trip-planner`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/cost-calculator`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/listings`,         lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/batteries`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/articles`,         lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/community`,        lastModified: new Date(), changeFrequency: "daily",   priority: 0.7 },
  ];

  // Dynamic EV pages
  let evPages: MetadataRoute.Sitemap = [];
  try {
    const evs = await prisma.evModel.findMany({ select: { slug: true, updatedAt: true } });
    evPages = evs.map((ev) => ({
      url: `${BASE}/ev/${ev.slug}`,
      lastModified: ev.updatedAt ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB unavailable during static generation — skip dynamic pages
  }

  // Dynamic article pages
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const articles = await prisma.article.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
    articlePages = articles.map((a) => ({
      url: `${BASE}/articles/${a.slug}`,
      lastModified: a.updatedAt ?? new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // DB unavailable — skip
  }

  return [...staticPages, ...evPages, ...articlePages];
}
