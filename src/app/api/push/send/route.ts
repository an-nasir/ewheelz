// src/app/api/push/send/route.ts
// Called by a cron/webhook when new listings arrive — finds matching subscribers
// and sends Expo push notifications
// POST { listingId } — secured by ADMIN_API_KEY header

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const ADMIN_KEY     = process.env.ADMIN_API_KEY ?? "";

interface PushMessage {
  to:    string;
  title: string;
  body:  string;
  data?: Record<string, unknown>;
  sound: "default";
}

async function sendExpoPush(messages: PushMessage[]) {
  if (messages.length === 0) return;
  // Expo allows up to 100 notifications per batch
  const batches: PushMessage[][] = [];
  for (let i = 0; i < messages.length; i += 100) batches.push(messages.slice(i, i + 100));

  for (const batch of batches) {
    await fetch(EXPO_PUSH_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body:    JSON.stringify(batch),
    });
  }
}

export async function POST(req: NextRequest) {
  // Auth check
  const key = req.headers.get("x-admin-key") ?? req.headers.get("authorization")?.replace("Bearer ", "");
  if (ADMIN_KEY && key !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = await req.json();
  if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

  // Fetch the new listing
  const listing = await prisma.listing.findUnique({
    where:   { id: listingId },
    include: { evModel: { select: { brand: true, model: true } } },
  });

  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const brand = listing.evModel?.brand ?? listing.evName?.split(" ")[0] ?? "EV";
  const model = listing.evModel?.model ?? "";
  const name  = `${brand} ${model}`.trim() || listing.evName || "Electric Vehicle";
  const price = `PKR ${(listing.price / 1_000_000).toFixed(1)}M`;

  // Find matching subscribers
  const where: Record<string, unknown> = {};
  // We'll fetch all subscribers and filter in-memory for flexibility
  const allSubs = await (prisma as any).pushSubscriber?.findMany?.() ?? [];

  const matched = allSubs.filter((sub: {
    brand?: string | null; city?: string | null; maxPrice?: number | null;
  }) => {
    if (sub.brand    && !brand.toLowerCase().includes(sub.brand.toLowerCase())) return false;
    if (sub.city     && listing.city !== sub.city) return false;
    if (sub.maxPrice && listing.price > sub.maxPrice) return false;
    return true;
  });

  if (matched.length === 0) return NextResponse.json({ sent: 0 });

  // Build push messages
  const messages: PushMessage[] = matched.map((sub: { token: string }) => ({
    to:    sub.token,
    title: `⚡ New ${brand} Listed!`,
    body:  `${name} · ${price} · ${listing.city}`,
    data:  { listingId: listing.id, screen: "listing" },
    sound: "default",
  }));

  await sendExpoPush(messages);

  console.log(`[push/send] Sent ${messages.length} notifications for listing ${listingId}`);
  return NextResponse.json({ sent: messages.length });
}

// GET /api/push/send?since=2024-01-01 — check for new listings to push (cron endpoint)
export async function GET(req: NextRequest) {
  const key = req.headers.get("x-admin-key") ?? req.nextUrl.searchParams.get("key");
  if (ADMIN_KEY && key !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find listings created in the last 10 minutes (cron runs every 10 min)
  const since = new Date(Date.now() - 10 * 60 * 1000);
  const newListings = await prisma.listing.findMany({
    where:   { status: "ACTIVE", createdAt: { gte: since } },
    include: { evModel: { select: { brand: true, model: true } } },
    take:    20,
  });

  let totalSent = 0;
  for (const listing of newListings) {
    const brand = listing.evModel?.brand ?? listing.evName?.split(" ")[0] ?? "EV";
    const model = listing.evModel?.model ?? "";
    const name  = `${brand} ${model}`.trim() || listing.evName || "Electric Vehicle";
    const price = `PKR ${(listing.price / 1_000_000).toFixed(1)}M`;

    const allSubs = await (prisma as any).pushSubscriber?.findMany?.() ?? [];
    const matched = allSubs.filter((sub: {
      brand?: string | null; city?: string | null; maxPrice?: number | null;
    }) => {
      if (sub.brand    && !brand.toLowerCase().includes(sub.brand.toLowerCase())) return false;
      if (sub.city     && listing.city !== sub.city) return false;
      if (sub.maxPrice && listing.price > sub.maxPrice) return false;
      return true;
    });

    if (matched.length > 0) {
      const messages: PushMessage[] = matched.map((sub: { token: string }) => ({
        to:    sub.token,
        title: `⚡ New ${brand} in ${listing.city}!`,
        body:  `${name} · ${price} — tap to view`,
        data:  { listingId: listing.id },
        sound: "default",
      }));
      await sendExpoPush(messages);
      totalSent += messages.length;
    }
  }

  return NextResponse.json({ newListings: newListings.length, totalSent });
}
