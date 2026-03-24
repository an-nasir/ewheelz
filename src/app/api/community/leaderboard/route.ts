export const dynamic = "force-dynamic";
// src/app/api/community/leaderboard/route.ts
// GET /api/community/leaderboard — efficiency leaderboard

import { NextResponse } from "next/server";
import { communityDb } from "@/lib/communityDb";

export const revalidate = 60;

export async function GET() {
  try {
    const leaderboard = await communityDb.efficiencyReport.getLeaderboard(20);
    return NextResponse.json({ leaderboard });
  } catch (err) {
    console.error("[community/leaderboard]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
