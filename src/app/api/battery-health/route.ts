// Battery health scoring API.

import { NextRequest, NextResponse } from "next/server";

import {
  calculateBatteryHealth,
  type BatteryHealthInput,
} from "@/lib/batteryHealth";

export async function POST(req: NextRequest) {
  try {
    const body: BatteryHealthInput = await req.json();

    if (!body.originalRange || !body.currentRange || body.originalRange <= 0) {
      return NextResponse.json({ error: "Invalid range values" }, { status: 400 });
    }

    if (body.currentRange > body.originalRange * 1.1) {
      return NextResponse.json(
        { error: "Current range cannot exceed original range significantly" },
        { status: 400 },
      );
    }

    return NextResponse.json(calculateBatteryHealth(body));
  } catch {
    return NextResponse.json(
      { error: "Failed to calculate battery health" },
      { status: 500 },
    );
  }
}
