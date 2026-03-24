// src/app/robots.ts — robots.txt generation
import { MetadataRoute } from "next";

const BASE = "https://ewheelz.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",       // Don't index API routes
          "/dashboard",  // Private user dashboard
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
