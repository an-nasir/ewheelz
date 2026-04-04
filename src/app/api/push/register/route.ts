// src/app/api/push/register/route.ts
// Stores Expo push token + price alert preferences in PushSubscriber table
// POST { token, brand?, city?, maxPrice? }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token, brand, city, maxPrice } = await req.json();
    if (!token) return NextResponse.json({ error: "No token" }, { status: 400 });

    await prisma.pushSubscriber.upsert({
      where:  { token },
      create: {
        token,
        brand:    brand    ?? null,
        city:     city     ?? null,
        maxPrice: maxPrice ?? null,
      },
      update: {
        brand:    brand    ?? null,
        city:     city     ?? null,
        maxPrice: maxPrice ?? null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Push register error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// GET ?brand=BYD&city=Lahore&maxPrice=8000000 — count matching active listings
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const brand    = searchParams.get("brand");
  const city     = searchParams.get("city");
  const maxPrice = searchParams.get("maxPrice");

  const where: Record<string, unknown> = { status: "ACTIVE" };
  if (brand)    where.evName = { contains: brand };
  if (city)     where.city   = city;
  if (maxPrice) where.price  = { lte: parseInt(maxPrice) };

  const count = await prisma.listing.count({ where });
  return NextResponse.json({ count });
}
