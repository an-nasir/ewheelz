// src/app/api/cron/price-alerts/route.ts
// Vercel Cron Job — runs daily via vercel.json schedule.
// Checks DB price alerts against current EV prices and fires email
// when the current price ≤ target OR when an EV becomes available in PK.
//
// Protect this endpoint: only Vercel cron or requests with CRON_SECRET header can call it.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Auth check — Vercel sends Authorization: Bearer <CRON_SECRET>
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let triggered = 0;
  let errors    = 0;

  // ── 1. PRICE_DROP alerts ─────────────────────────────────────────────────
  const priceAlerts = await prisma.priceAlert.findMany({
    where: { alertType: "PRICE_DROP", status: "ACTIVE" },
  });

  for (const alert of priceAlerts) {
    if (!alert.evSlug) continue;

    const ev = await prisma.evModel.findFirst({
      where: { slug: alert.evSlug },
      select: { brand: true, model: true, pricePkrMin: true, pricePkrMax: true },
    });
    if (!ev || ev.pricePkrMin == null) continue;

    const currentPrice = ev.pricePkrMin;

    // Fire if: no target set (any drop triggers), OR current < target
    const shouldFire =
      !alert.targetPrice || currentPrice <= alert.targetPrice;

    if (!shouldFire) continue;

    // Send email
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const evName = `${ev.brand} ${ev.model}`;
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? "eWheelz <hello@ewheelz.pk>",
          to:   alert.email,
          subject: `📉 Price Drop Alert: ${evName} is now PKR ${(currentPrice / 1_000_000).toFixed(1)}M`,
          html: `
<div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#F6F8FF;border-radius:16px;">
  <div style="background:linear-gradient(135deg,#6366F1,#8B5CF6);padding:20px 24px;border-radius:12px;color:#fff;margin-bottom:20px;">
    <div style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.7;margin-bottom:4px;">Price Drop Alert</div>
    <div style="font-size:22px;font-weight:900;">${evName}</div>
  </div>
  <p style="color:#0F172A;font-size:16px;font-weight:700;margin:0 0 8px;">🎉 Price has dropped!</p>
  <p style="color:#64748B;font-size:14px;margin:0 0 16px;">The ${evName} price is now <strong style="color:#16A34A;">PKR ${(currentPrice / 1_000_000).toFixed(1)}M</strong>${alert.targetPrice ? ` — below your target of PKR ${(alert.targetPrice / 1_000_000).toFixed(1)}M` : ""}.</p>
  <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://ewheelz.vercel.app"}/ev/${alert.evSlug}?utm_source=price_alert&utm_medium=email" style="display:inline-block;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:12px;text-decoration:none;">
    View ${evName} →
  </a>
  <p style="color:#94A3B8;font-size:11px;margin-top:20px;">You set this alert at ewheelz.vercel.app · <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://ewheelz.vercel.app"}" style="color:#94A3B8;">Unsubscribe</a></p>
</div>`,
        });

        // Mark as triggered
        await prisma.priceAlert.update({
          where: { id: alert.id },
          data:  { status: "TRIGGERED" },
        });
        triggered++;
      } catch (e) {
        console.error("[price-alert cron] email failed", e);
        errors++;
      }
    }
  }

  // ── 2. AVAILABILITY alerts ───────────────────────────────────────────────
  const availAlerts = await prisma.priceAlert.findMany({
    where: { alertType: "AVAILABILITY", status: "ACTIVE" },
  });

  for (const alert of availAlerts) {
    if (!alert.evSlug) continue;

    const ev = await prisma.evModel.findFirst({
      where: { slug: alert.evSlug, availableInPk: true },
      select: { brand: true, model: true, pricePkrMin: true },
    });
    if (!ev) continue;  // still not available

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const evName = `${ev.brand} ${ev.model}`;
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? "eWheelz <hello@ewheelz.pk>",
          to:   alert.email,
          subject: `🎉 ${evName} is now available in Pakistan!`,
          html: `
<div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#F6F8FF;border-radius:16px;">
  <div style="background:linear-gradient(135deg,#F59E0B,#EF4444);padding:20px 24px;border-radius:12px;color:#fff;margin-bottom:20px;">
    <div style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.7;margin-bottom:4px;">🔔 Availability Alert</div>
    <div style="font-size:22px;font-weight:900;">${evName}</div>
  </div>
  <p style="color:#0F172A;font-size:16px;font-weight:700;margin:0 0 8px;">The wait is over! 🇵🇰</p>
  <p style="color:#64748B;font-size:14px;margin:0 0 16px;">The <strong>${evName}</strong> is now officially available in Pakistan${ev.pricePkrMin ? ` starting from <strong>PKR ${(ev.pricePkrMin / 1_000_000).toFixed(1)}M</strong>` : ""}.</p>
  <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://ewheelz.vercel.app"}/ev/${alert.evSlug}?utm_source=availability_alert&utm_medium=email" style="display:inline-block;background:linear-gradient(135deg,#F59E0B,#EF4444);color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:12px;text-decoration:none;">
    View ${evName} →
  </a>
  <p style="color:#94A3B8;font-size:11px;margin-top:20px;">You set this alert at ewheelz.vercel.app</p>
</div>`,
        });

        await prisma.priceAlert.update({
          where: { id: alert.id },
          data:  { status: "TRIGGERED" },
        });
        triggered++;
      } catch (e) {
        console.error("[availability-alert cron] email failed", e);
        errors++;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    priceAlertsChecked: priceAlerts.length,
    availAlertsChecked: availAlerts.length,
    triggered,
    errors,
    ts: new Date().toISOString(),
  });
}
