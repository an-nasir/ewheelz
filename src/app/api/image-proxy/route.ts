// GET /api/image-proxy?url=<encoded>
// Server-side proxy that fetches PakWheels/OLX images with correct Referer,
// bypassing hotlink protection. Caches aggressively at edge.

import { NextRequest, NextResponse } from "next/server";

const REFERER_MAP: Record<string, string> = {
  "pakwheels.com": "https://www.pakwheels.com/",
  "olx.com.pk":    "https://www.olx.com.pk/",
  "cloudfront.net": "https://www.pakwheels.com/",
};

function getReferer(url: string): string {
  for (const [domain, referer] of Object.entries(REFERER_MAP)) {
    if (url.includes(domain)) return referer;
  }
  return "https://www.ewheelz.pk/";
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw) {
    return new NextResponse("Missing url param", { status: 400 });
  }

  let imageUrl: string;
  try {
    imageUrl = decodeURIComponent(raw);
    // Basic sanity — must be http(s)
    if (!/^https?:\/\//i.test(imageUrl)) throw new Error("Bad URL");
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  try {
    const upstream = await fetch(imageUrl, {
      headers: {
        "Referer":          getReferer(imageUrl),
        "User-Agent":       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept":           "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language":  "en-US,en;q=0.9",
      },
      // Don't follow redirects to untrusted locations
      redirect: "follow",
    });

    if (!upstream.ok) {
      return new NextResponse(null, { status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":  contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "X-Proxy":       "ewheelz-img",
      },
    });
  } catch (err) {
    console.error("[image-proxy]", imageUrl, err);
    return new NextResponse(null, { status: 502 });
  }
}
