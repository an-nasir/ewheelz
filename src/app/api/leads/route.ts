// src/app/api/leads/route.ts
// Saves a dealer enquiry (lead) and optionally fires an email notification
// to the admin via Resend if RESEND_API_KEY + LEAD_NOTIFICATION_EMAIL are set.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { evModelId, evName, name, phone, email, city, message, source } =
      await request.json();

    // Basic validation
    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }
    if (phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        evModelId: evModelId ?? null,
        evName:    evName    ?? null,
        name:      name.trim(),
        phone:     phone.trim(),
        email:     email?.trim() ?? null,
        city:      city?.trim()  ?? null,
        message:   message?.trim() ?? null,
        source:    source ?? "ev_detail",
        status:    "NEW",
      },
    });

    // ── Optional admin notification email ────────────────────────────────────
    if (process.env.RESEND_API_KEY && process.env.LEAD_NOTIFICATION_EMAIL) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "eWheelz <hello@ewheelz.pk>",
        to:   process.env.LEAD_NOTIFICATION_EMAIL,
        subject: `🚗 New Lead: ${name} interested in ${evName ?? "an EV"}`,
        html: `
          <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#F6F8FF;border-radius:16px;">
            <h2 style="color:#0F172A;margin-bottom:4px;">New Lead — eWheelz</h2>
            <p style="color:#64748B;font-size:14px;margin-top:0;">Someone is interested in buying an EV</p>
            <table style="width:100%;border-collapse:collapse;margin-top:16px;background:#fff;border-radius:12px;overflow:hidden;">
              ${[
                ["EV of Interest", evName ?? "—"],
                ["Name",           name],
                ["Phone",          phone],
                ["Email",          email ?? "—"],
                ["City",           city  ?? "—"],
                ["Message",        message ?? "—"],
                ["Source",         source ?? "ev_detail"],
                ["Lead ID",        lead.id],
              ].map(([k, v]) => `
                <tr>
                  <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#64748B;border-bottom:1px solid #F1F5F9;width:35%;">${k}</td>
                  <td style="padding:10px 16px;font-size:13px;color:#0F172A;border-bottom:1px solid #F1F5F9;">${v}</td>
                </tr>`).join("")}
            </table>
            <p style="font-size:12px;color:#94A3B8;margin-top:16px;">Sent from eWheelz · Lead captured at ${new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" })} PKT</p>
          </div>`,
      });
    }

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (err) {
    console.error("[leads]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// GET — simple count for admin dashboards
export async function GET() {
  try {
    const count = await prisma.lead.count({ where: { status: "NEW" } });
    return NextResponse.json({ newLeads: count });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
