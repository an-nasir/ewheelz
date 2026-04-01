// src/app/api/battery-health/route.ts
// Battery health scoring engine — takes diagnostic answers, returns a graded report

import { NextRequest, NextResponse } from "next/server";

export interface BatteryHealthInput {
  evName: string;           // free text — make/model
  year: number;             // purchase year
  odometer: number;         // km
  originalRange: number;    // WLTP or claimed range (km)
  currentRange: number;     // what they actually get now on full charge (km)
  dcFrequency: "never" | "occasionally" | "regularly" | "daily";
  chargeTo100: "never" | "sometimes" | "often" | "always";
  chargeTimeChange: "no" | "slightly" | "significantly";
  warningLights: boolean;
  heatRangeLoss: "minimal" | "moderate" | "severe";
}

export interface BatteryHealthReport {
  grade: "A" | "B" | "C" | "D" | "F";
  score: number;             // 0-100
  healthPct: number;         // estimated battery health %
  rangeRetention: number;    // current / original * 100
  categories: CategoryScore[];
  verdict: string;
  recommendation: string;
  urgency: "low" | "medium" | "high" | "critical";
  shareToken: string;
}

interface CategoryScore {
  label: string;
  score: number;   // 0-100
  icon: string;
  detail: string;
}

function randomToken() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function scoreToGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 88) return "A";
  if (score >= 76) return "B";
  if (score >= 62) return "C";
  if (score >= 48) return "D";
  return "F";
}

export function calculateBatteryHealth(input: BatteryHealthInput): BatteryHealthReport {
  const rangeRetention = Math.min(100, Math.round((input.currentRange / input.originalRange) * 100));

  // ── 1. Range Retention category (weight: 45 pts) ────────────────────────────
  let rangeScore = rangeRetention; // starts at retention %
  let rangeDetail = "";
  if (rangeRetention >= 95) rangeDetail = "Excellent — barely any degradation.";
  else if (rangeRetention >= 85) rangeDetail = "Good — normal aging for the mileage.";
  else if (rangeRetention >= 75) rangeDetail = "Fair — noticeable drop, still usable.";
  else if (rangeRetention >= 65) rangeDetail = "Poor — significant capacity loss.";
  else { rangeDetail = "Critical — battery needs inspection urgently."; rangeScore = Math.max(0, rangeScore - 10); }

  // ── 2. Charging Habits category (weight: 25 pts) ────────────────────────────
  let chargingScore = 100;
  if (input.dcFrequency === "daily")        chargingScore -= 30;
  else if (input.dcFrequency === "regularly") chargingScore -= 18;
  else if (input.dcFrequency === "occasionally") chargingScore -= 6;

  if (input.chargeTo100 === "always")      chargingScore -= 20;
  else if (input.chargeTo100 === "often")  chargingScore -= 10;
  else if (input.chargeTo100 === "sometimes") chargingScore -= 4;

  chargingScore = Math.max(0, chargingScore);
  const chargingDetail =
    chargingScore >= 85 ? "Great habits — you're treating this battery well." :
    chargingScore >= 60 ? "Decent — some habits could be improved." :
    chargingScore >= 35 ? "Risky — frequent DC charging and 100% charges are accelerating wear." :
    "Damaging — these charging habits are the #1 reason for early battery death.";

  // ── 3. Thermal Health (weight: 15 pts) ──────────────────────────────────────
  let thermalScore = 100;
  if (input.heatRangeLoss === "severe")    thermalScore -= 40;
  else if (input.heatRangeLoss === "moderate") thermalScore -= 15;

  thermalScore = Math.max(0, thermalScore);
  const thermalDetail =
    thermalScore >= 85 ? "Battery handles Pakistan heat well." :
    thermalScore >= 60 ? "Moderate thermal degradation — normal for older cells." :
    "Severe heat sensitivity — possible thermal management issue.";

  // ── 4. Electrical Health (weight: 15 pts) ───────────────────────────────────
  let electricalScore = 100;
  if (input.warningLights)                electricalScore -= 45;
  if (input.chargeTimeChange === "significantly") electricalScore -= 30;
  else if (input.chargeTimeChange === "slightly") electricalScore -= 12;

  electricalScore = Math.max(0, electricalScore);
  const electricalDetail =
    electricalScore >= 85 ? "No fault signals detected." :
    electricalScore >= 55 ? "Minor electrical changes — worth monitoring." :
    "Warning signs present — get a workshop diagnostic before buying/selling.";

  // ── Weighted final score ─────────────────────────────────────────────────────
  const score = Math.round(
    rangeScore      * 0.45 +
    chargingScore   * 0.25 +
    thermalScore    * 0.15 +
    electricalScore * 0.15
  );

  // Estimated health % — slightly more generous than raw score since score includes habits
  const healthPct = Math.round(Math.min(100, rangeRetention * 0.65 + score * 0.35));

  const grade = scoreToGrade(score);

  const urgency: BatteryHealthReport["urgency"] =
    grade === "F" ? "critical" :
    grade === "D" ? "high" :
    grade === "C" ? "medium" : "low";

  const verdict =
    grade === "A" ? "This battery is in great shape. You're safe to buy, sell, or keep driving." :
    grade === "B" ? "Healthy battery with minor wear. Standard for the age and mileage." :
    grade === "C" ? "Noticeable degradation. Fine for daily use but factor this into pricing." :
    grade === "D" ? "Significant wear detected. Get a workshop inspection before any transaction." :
    "Battery health is concerning. Do NOT buy or sell without a certified workshop report.";

  const recommendation =
    grade === "A" ? "Keep charging between 20-80%. Avoid daily DC fast charging." :
    grade === "B" ? "Maintain good habits. Consider getting a baseline check at a workshop." :
    grade === "C" ? "Negotiate price accordingly. A verified report could help both buyer and seller." :
    grade === "D" ? "A certified battery health report is essential before proceeding with any sale." :
    "Immediate workshop inspection needed. This battery may require reconditioning or replacement.";

  return {
    grade,
    score,
    healthPct,
    rangeRetention,
    categories: [
      { label: "Range Retention",    score: rangeScore,      icon: "📍", detail: rangeDetail },
      { label: "Charging Habits",    score: chargingScore,   icon: "⚡", detail: chargingDetail },
      { label: "Thermal Health",     score: thermalScore,    icon: "🌡️", detail: thermalDetail },
      { label: "Electrical Health",  score: electricalScore, icon: "🔌", detail: electricalDetail },
    ],
    verdict,
    recommendation,
    urgency,
    shareToken: randomToken(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: BatteryHealthInput = await req.json();

    // Basic validation
    if (!body.originalRange || !body.currentRange || body.originalRange <= 0) {
      return NextResponse.json({ error: "Invalid range values" }, { status: 400 });
    }
    if (body.currentRange > body.originalRange * 1.1) {
      return NextResponse.json({ error: "Current range cannot exceed original range significantly" }, { status: 400 });
    }

    const report = calculateBatteryHealth(body);
    return NextResponse.json(report);
  } catch {
    return NextResponse.json({ error: "Failed to calculate battery health" }, { status: 500 });
  }
}
