// GET /api/charging-stations — Charging station locator
// Query params: city, network, connector
// NOTE: connectorTypes stored as comma-separated string for SQLite compat
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const network = searchParams.get("network");
  const connector = searchParams.get("connector");

  // Build where clause — use string contains for SQLite compat
  const where: Record<string, unknown> = {};
  if (city) where.city = { contains: city };
  if (network) where.network = { contains: network };
  // For connector: SQLite stores as CSV so we use contains
  if (connector) where.connectorTypes = { contains: connector };

  const stations = await prisma.chargingStation.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    count: stations.length,
    data: stations,
  });
}
