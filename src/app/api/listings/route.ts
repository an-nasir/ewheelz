export const dynamic = "force-dynamic";
// GET /api/listings — Marketplace listings with filters
// POST /api/listings — Create a new listing
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const brand = searchParams.get("brand");
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");
  const condition = searchParams.get("condition");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  const where: Record<string, unknown> = { status: "ACTIVE" };
  if (city) where.city = city;
  if (condition) where.condition = condition;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Record<string, number>).gte = parseInt(minPrice);
    if (maxPrice) (where.price as Record<string, number>).lte = parseInt(maxPrice);
  }
  if (brand) {
    where.evModel = { brand };
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        evModel: {
          select: {
            brand: true,
            model: true,
            variant: true,
            slug: true,
            powertrain: true,
            imageUrl: true,
          },
        },
        user: {
          select: { name: true, city: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);

  return NextResponse.json({
    count: listings.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: listings,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const listing = await prisma.listing.create({
      data: {
        userId: body.userId,
        evModelId: body.evModelId,
        price: body.price,
        year: body.year,
        mileage: body.mileage,
        city: body.city,
        batteryHealth: body.batteryHealth,
        condition: body.condition || "USED",
        description: body.description,
      },
    });

    return NextResponse.json({ data: listing }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create listing", details: String(error) },
      { status: 400 }
    );
  }
}
