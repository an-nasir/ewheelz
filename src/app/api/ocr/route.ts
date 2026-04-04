// src/app/api/ocr/route.ts
// Accepts base64 image → returns extracted text via OCR.Space (free tier, no key needed for dev)
// Set OCR_SPACE_KEY env var for production (free at ocr.space/ocrapi)

import { NextRequest, NextResponse } from "next/server";

const OCR_KEY = process.env.OCR_SPACE_KEY ?? "helloworld"; // free demo key

export async function POST(req: NextRequest) {
  try {
    const { base64, mimeType = "image/jpeg" } = await req.json();
    if (!base64) return NextResponse.json({ error: "No image" }, { status: 400 });

    const form = new FormData();
    form.append("base64Image", `data:${mimeType};base64,${base64}`);
    form.append("language",    "eng");
    form.append("isOverlayRequired", "false");
    form.append("OCREngine",   "2"); // engine 2 = better for screenshots

    const res  = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { apikey: OCR_KEY },
      body: form,
    });

    const data = await res.json();
    const text = data?.ParsedResults?.[0]?.ParsedText ?? "";

    if (!text.trim()) {
      return NextResponse.json({ text: "", error: "No text detected" });
    }

    return NextResponse.json({ text: text.trim() });
  } catch (err) {
    console.error("OCR error:", err);
    return NextResponse.json({ error: "OCR failed" }, { status: 500 });
  }
}
