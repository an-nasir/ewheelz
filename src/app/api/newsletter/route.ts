// src/app/api/newsletter/route.ts
// Accepts a newsletter signup, deduplicates against the DB, and optionally
// sends a welcome email via Resend if RESEND_API_KEY is configured.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, source, locale } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Upsert — silently succeed if already subscribed
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},          // nothing to update — already subscribed
      create: { email, source: source ?? "footer", locale: locale ?? "en" },
    });

    // ── Optional Resend welcome email ────────────────────────────────────────
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "eWheelz <hello@ewheelz.pk>",
        to: email,
        subject: "Welcome to eWheelz — Pakistan's EV Intelligence Platform ⚡",
        html: `
          <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#F6F8FF;">
            <div style="text-align:center;margin-bottom:32px;">
              <div style="display:inline-block;width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#6366F1,#8B5CF6);line-height:48px;text-align:center;font-size:24px;">⚡</div>
              <h1 style="font-size:22px;font-weight:900;color:#0F172A;margin:16px 0 4px;">You're in!</h1>
              <p style="color:#64748B;font-size:14px;margin:0;">Pakistan's first EV intelligence newsletter</p>
            </div>
            <div style="background:#fff;border-radius:24px;padding:28px;border:1px solid #E6E9F2;">
              <p style="color:#334155;font-size:15px;line-height:1.6;">Hi there 👋</p>
              <p style="color:#334155;font-size:15px;line-height:1.6;">
                Thanks for subscribing to eWheelz updates. Every week you'll get:
              </p>
              <ul style="color:#334155;font-size:14px;line-height:2;padding-left:20px;">
                <li>🚗 New EV model launches & Pakistan pricing</li>
                <li>⚡ Charging station updates</li>
                <li>💰 Cost comparison guides</li>
                <li>🔋 Battery & range deep-dives</li>
              </ul>
              <div style="margin-top:24px;text-align:center;">
                <a href="https://ewheelz.vercel.app/en/ev"
                   style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;font-weight:700;font-size:14px;border-radius:12px;text-decoration:none;">
                  Explore EV Database →
                </a>
              </div>
            </div>
            <p style="text-align:center;color:#94A3B8;font-size:12px;margin-top:24px;">
              eWheelz · Pakistan's EV Intelligence Platform<br/>
              <a href="https://ewheelz.vercel.app/en" style="color:#6366F1;text-decoration:none;">ewheelz.pk</a>
            </p>
          </div>`,
      });
    }

    return NextResponse.json({ success: true, alreadySubscribed: !subscriber });
  } catch (err: any) {
    // P2002 = Prisma unique-constraint violation (already subscribed) — treat as success
    if (err?.code === "P2002") {
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }
    console.error("[newsletter]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
