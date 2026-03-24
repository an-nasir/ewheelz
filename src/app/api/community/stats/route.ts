export const dynamic = "force-dynamic";
// src/app/api/community/stats/route.ts
// GET /api/community/stats — aggregate stats for EV Intelligence Dashboard

import { NextResponse } from "next/server";
import { communityDb } from "@/lib/communityDb";

export const revalidate = 60; // cache for 60 seconds

export async function GET() {
  try {
    const [stats, reliability] = await Promise.all([
      communityDb.stats.get(),
      communityDb.stats.getReliabilityBoard(),
    ]);
    return NextResponse.json({ stats, reliability });
  } catch (err) {
    console.error("[community/stats]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
