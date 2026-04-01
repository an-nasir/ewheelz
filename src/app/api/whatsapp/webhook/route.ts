// src/app/api/whatsapp/webhook/route.ts
// Meta WhatsApp Cloud API webhook.
//
// ENV vars needed (add to Vercel + .env.local):
//   WHATSAPP_TOKEN        — Meta access token
//   WHATSAPP_PHONE_ID     — phone number ID from Meta dashboard
//   WHATSAPP_VERIFY_TOKEN — any string you set in Meta dashboard (e.g. "ewheelz2025")

import { NextRequest, NextResponse } from "next/server";
import { generateReply } from "@/lib/bot-engine";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? "ewheelz2025";
const WA_TOKEN    = process.env.WHATSAPP_TOKEN ?? "";
const PHONE_ID    = process.env.WHATSAPP_PHONE_ID ?? "";

// ── GET: Meta webhook verification (one-time setup) ───────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode      = searchParams.get("hub.mode");
  const token     = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// ── POST: incoming WhatsApp messages ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const entry   = body?.entry?.[0];
    const change  = entry?.changes?.[0];
    const value   = change?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ status: "no_message" });
    }

    const from = message.from;                   // sender's phone e.g. "923001234567"
    const text = message.text?.body ?? "";

    if (!text.trim()) {
      return NextResponse.json({ status: "empty_message" });
    }

    // Generate reply using bot engine
    const reply = await generateReply(text);

    // Send reply back via Meta API
    await sendWhatsAppMessage(from, reply);

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

async function sendWhatsAppMessage(to: string, text: string) {
  if (!WA_TOKEN || !PHONE_ID) {
    // Dev mode — just log the reply
    console.log(`\n[WhatsApp Bot Reply to ${to}]\n${text}\n`);
    return;
  }

  const url = `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`;
  await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WA_TOKEN}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text, preview_url: true },
    }),
  });
}
