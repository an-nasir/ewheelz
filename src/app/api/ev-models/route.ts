// GET /api/ev-models — List all EV models with filters
// Query params: brand, powertrain, segment, available_in_pk, sort
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const brand = searchParams.get("brand");
  const powertrain = searchParams.get("powertrain");
  const segment = searchParams.get("segment");
  const availableInPk = searchParams.get("available_in_pk");
  const sort = searchParams.get("sort") || "brand"; // brand, price, range, year

  // Build where clause from filters
  const where: Record<string, unknown> = {};
  if (brand) where.brand = brand;
  if (powertrain) where.powertrain = powertrain;
  if (segment) where.segment = segment;
  if (availableInPk === "true") where.availableInPk = true;

  // Build orderBy from sort param
  type OrderBy = Record<string, string | Record<string, string>>;
  let orderBy: OrderBy = { brand: "asc" };
  if (sort === "price") orderBy = { pricePkrMin: "asc" };
  if (sort === "range") orderBy = { brand: "asc" }; // relation orderBy not supported in SQLite; default to brand
  if (sort === "year") orderBy = { year: "desc" };

  const models = await prisma.evModel.findMany({
    where,
    orderBy,
    include: {
      specs: {
        select: {
          rangeWltp: true,
          rangeRealWorld: true,
          batteryCapKwh: true,
          motorPowerKw: true,
          chargingDcKw: true,
          driveType: true,
          accel0100: true,
        },
      },
      battery: {
        select: {
          chemistry: true,
          capacityKwh: true,
        },
      },
      _count: {
        select: { listings: true, reviews: true },
      },
    },
  });

  return NextResponse.json({
    count: models.length,
    data: models,
  });
}
