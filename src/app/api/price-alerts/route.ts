// src/app/api/price-alerts/route.ts
// Handles both PRICE_DROP and AVAILABILITY alerts.
// Deduplicates per email + evSlug + alertType so repeat submits are silent.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, evModelId, evName, evSlug, targetPrice, alertType } =
      await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    if (!evSlug) {
      return NextResponse.json({ error: "EV slug required" }, { status: 400 });
    }

    // Check for existing active alert for same email + ev + type
    const existing = await prisma.priceAlert.findFirst({
      where: { email, evSlug, alertType: alertType ?? "PRICE_DROP", status: "ACTIVE" },
    });

    if (existing) {
      return NextResponse.json({ success: true, alreadySet: true });
    }

    await prisma.priceAlert.create({
      data: {
        email,
        evModelId: evModelId ?? null,
        evName:    evName    ?? null,
        evSlug,
        targetPrice: targetPrice ?? null,
        alertType:  alertType ?? "PRICE_DROP",
      },
    });

    // Optional Resend confirmation
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const isAvailability = alertType === "AVAILABILITY";

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "eWheelz <hello@ewheelz.pk>",
        to: email,
        subject: isAvailability
          ? `🔔 We'll notify you when ${evName} arrives in Pakistan`
          : `📉 Price alert set for ${evName}`,
        html: `<p>Hi! You're on the list. We'll email you the moment ${
          isAvailability ? `${evName} becomes available in Pakistan` : `the ${evName} price drops`
        }.</p><p>— eWheelz Team</p>`,
      });
    }

    return NextResponse.json({ success: true, alreadySet: false });
  } catch (err) {
    console.error("[price-alerts]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
