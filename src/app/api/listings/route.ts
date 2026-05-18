export const dynamic = "force-dynamic";
// GET /api/listings  — Marketplace listings with filters
// POST /api/listings — Create listing (auth optional — anonymous allowed)

import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { calcDealGrade } from "@/lib/dealGrade";

function parseInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function parseOptionalInteger(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  return parseInteger(value);
}

function parseOptionalFloat(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizePakistanPhone(value: unknown): string | null {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (/^923\d{9}$/.test(digits)) return digits;
  if (/^03\d{9}$/.test(digits)) return `92${digits.slice(1)}`;
  if (/^3\d{9}$/.test(digits)) return `92${digits}`;
  return null;
}

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
  if (brand) {
    where.OR = [
      { evModel: { brand } },
      { evName: { contains: brand } },
    ];
  }

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
    const normalizedPhone = normalizePakistanPhone(contactPhone);
    const normalizedWhatsapp = contactWhatsapp
      ? normalizePakistanPhone(contactWhatsapp)
      : normalizedPhone;

    if (!normalizedPhone) {
      return NextResponse.json({ error: "Enter a valid 10-digit phone number" }, { status: 400 });
    }

    const parsedPrice = parseInteger(price);
    const parsedYear = parseInteger(year);
    const parsedMileage = parseOptionalInteger(mileage);
    const parsedBatteryHealth = parseOptionalFloat(batteryHealth);
    const currentYear = new Date().getFullYear();

    if (!parsedPrice || parsedPrice < 500_000 || parsedPrice > 100_000_000) {
      return NextResponse.json({ error: "Enter a realistic PKR price" }, { status: 400 });
    }

    if (!parsedYear || parsedYear < 2010 || parsedYear > currentYear + 1) {
      return NextResponse.json({ error: "Enter a realistic model year" }, { status: 400 });
    }

    if (parsedMileage != null && (parsedMileage < 0 || parsedMileage > 500_000)) {
      return NextResponse.json({ error: "Enter realistic mileage" }, { status: 400 });
    }

    if (parsedBatteryHealth != null && (parsedBatteryHealth < 0 || parsedBatteryHealth > 100)) {
      return NextResponse.json({ error: "Battery signal must be between 0 and 100" }, { status: 400 });
    }

    // Compute deal grade using live market comps
    const compsWhere: Record<string, unknown> = { status: "ACTIVE" };
    if (evModelId)   compsWhere.evModelId = evModelId;
    else if (evName) compsWhere.evName    = { contains: evName.split(" ")[0] };

    const comps = await prisma.listing.findMany({
      where:   compsWhere,
      select:  { price: true },
      orderBy: { createdAt: "desc" },
      take:    30,
    });
    const prices = comps.map(c => c.price);
    const avgMarketPrice = prices.length
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      : null;

    const dealGrade = calcDealGrade(
      parsedPrice,
      avgMarketPrice,
      parsedBatteryHealth,
      parsedMileage,
      parsedYear,
    );

    const listing = await prisma.listing.create({
      data: {
        userId:          null,            // anonymous by default
        evModelId:       evModelId  ?? null,
        evName:          evName     ?? null,
        price:           parsedPrice,
        year:            parsedYear,
        mileage:         parsedMileage,
        city:            String(city).trim(),
        batteryHealth:   parsedBatteryHealth,
        condition:       condition ?? "USED",
        description:     description?.trim()     ?? null,
        images:          images ? JSON.stringify(images) : null,
        contactName:     contactName?.trim()      ?? null,
        contactPhone:    normalizedPhone,
        contactWhatsapp: normalizedWhatsapp,
        status:          "PENDING",
        featured:        false,
        dealGrade:       dealGrade,
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
          subject: `New listing pending review: ${evName ?? "EV"} - PKR ${Number(price).toLocaleString()}`,
          html:    `<p><strong>New listing (PENDING review)</strong><br/>
            EV: ${evName ?? "—"}<br/>Price: PKR ${Number(price).toLocaleString()}<br/>
            Year: ${year} | Km: ${mileage ?? "N/A"} | City: ${city}<br/>
            Contact: ${contactName ?? ""} · ${contactPhone} · WA: ${contactWhatsapp ?? "—"}<br/>
            Listing ID: <code>${listing.id}</code></p>`,
        });
      } catch { /* non-blocking */ }
    }

    return NextResponse.json({
      success: true,
      listingId: listing.id,
      sellerToken: listing.sellerToken,
      status: listing.status,
    }, { status: 201 });
  } catch (err) {
    console.error("[listings POST]", err);
    return NextResponse.json({ error: "Failed to create listing", details: String(err) }, { status: 500 });
  }
}
