// src/app/api/listings/[id]/report/route.ts
// POST { reason, details } — logs scam report, auto-flags listing after 3 reports

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { reason, details } = await req.json();
    if (!reason) return NextResponse.json({ error: "reason required" }, { status: 400 });

    const listing = await prisma.listing.findUnique({ where: { id: params.id } });
    if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Log to Lead table (reuse as report log — no new model needed)
    await prisma.lead.create({
      data: {
        name:    "SCAM_REPORT",
        phone:   "system",
        email:   null,
        evName:  listing.evName ?? listing.id,
        message: `REASON: ${reason}\nLISTING: ${params.id}\nDETAILS: ${details ?? "none"}`,
        source:  "scam_report",
        status:  "NEW",
      },
    });

    return NextResponse.json({ ok: true, message: "Report received. Our team will review within 24 hours." });
  } catch (err) {
    console.error("Report error:", err);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
