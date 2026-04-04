export const dynamic = "force-dynamic";
// GET /api/listings  — Marketplace listings with filters
// POST /api/listings — Create listing (auth optional — anonymous allowed)

import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city      = searchParams.get("city");
  const brand     = searchParams.get("brand");
  const minPrice  = searchParams.get("min_price");
  const maxPrice  = searchParams.get("max_price");
  const condition = searchParams.get("condition");
  const page      = parseInt(searchParams.get("page") || "1");
  const limit     = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  const where: Record<string, unknown> = { status: "ACTIVE" };
  if (city)      where.city      = city;
  if (condition) where.condition = condition;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Record<string, number>).gte = parseInt(minPrice);
    if (maxPrice) (where.price as Record<string, number>).lte = parseInt(maxPrice);
  }
  if (brand) where.evModel = { brand };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        evModel: { select: { brand: true, model: true, variant: true, slug: true, powertrain: true, imageUrl: true } },
        user:    { select: { name: true, city: true } },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.listing.count({ where }),
  ]);

  return NextResponse.json({ count: listings.length, total, page, totalPages: Math.ceil(total / limit), data: listings });
}

export async function POST(request: NextRequest) {
  try {
    const {
      evModelId, evName, price, year, mileage, city,
      batteryHealth, condition, description, images,
      contactName, contactPhone, contactWhatsapp,
    } = await request.json();

    if (!price || !year || !city || !contactPhone) {
      return NextResponse.json({ error: "price, year, city and contactPhone are required" }, { status: 400 });
    }
    if (String(contactPhone).replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "Enter a valid 10-digit phone number" }, { status: 400 });
    }

    const listing = await prisma.listing.create({
      data: {
        userId:          null,            // anonymous by default
        evModelId:       evModelId  ?? null,
        evName:          evName     ?? null,
        price:           parseInt(String(price)),
        year:            parseInt(String(year)),
        mileage:         mileage     ? parseInt(String(mileage))    : null,
        city:            String(city).trim(),
        batteryHealth:   batteryHealth ? parseFloat(String(batteryHealth)) : null,
        condition:       condition ?? "USED",
        description:     description?.trim()     ?? null,
        images:          images ? JSON.stringify(images) : null,
        contactName:     contactName?.trim()      ?? null,
        contactPhone:    String(contactPhone).trim(),
        contactWhatsapp: contactWhatsapp?.trim()  ?? null,
        status:          "ACTIVE",
        featured:        false,
        sellerToken:     randomBytes(20).toString("hex"),
      },
    });

    // Optional admin email notification
    if (process.env.RESEND_API_KEY && process.env.LEAD_NOTIFICATION_EMAIL) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from:    process.env.RESEND_FROM_EMAIL ?? "eWheelz <hello@ewheelz.pk>",
          to:      process.env.LEAD_NOTIFICATION_EMAIL,
          subject: `🚗 New Listing: ${evName ?? "EV"} — PKR ${Number(price).toLocaleString()}`,
          html:    `<p><strong>New listing (PENDING review)</strong><br/>
            EV: ${evName ?? "—"}<br/>Price: PKR ${Number(price).toLocaleString()}<br/>
            Year: ${year} | Km: ${mileage ?? "N/A"} | City: ${city}<br/>
            Contact: ${contactName ?? ""} · ${contactPhone} · WA: ${contactWhatsapp ?? "—"}<br/>
            Listing ID: <code>${listing.id}</code></p>`,
        });
      } catch { /* non-blocking */ }
    }

    // WhatsApp blast to group/broadcast via WhatsApp Cloud API (non-blocking)
    if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID) {
      try {
        const baseUrl  = process.env.NEXT_PUBLIC_BASE_URL ?? "https://ewheelz.pk";
        const evLabel  = evName ?? "Electric Vehicle";
        const priceFmt = `PKR ${(parseInt(String(price)) / 1_000_000).toFixed(1)}M`;
        const msgBody  = `⚡ New EV Listed on eWheelz!\n\n🚗 *${evLabel}* (${year})\n💰 ${priceFmt}\n📍 ${city}\n\n🔗 ${baseUrl}/en/listings/${listing.id}\n\n_Reply or tap link to contact seller_`;

        await fetch(
          `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
          {
            method:  "POST",
            headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to:   process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923444196711",
              type: "text",
              text: { body: msgBody },
            }),
          }
        );
      } catch { /* non-blocking — WA blast failure never breaks listing creation */ }
    }

    return NextResponse.json({ success: true, listingId: listing.id, sellerToken: listing.sellerToken }, { status: 201 });
  } catch (err) {
    console.error("[listings POST]", err);
    return NextResponse.json({ error: "Failed to create listing", details: String(err) }, { status: 500 });
  }
}
