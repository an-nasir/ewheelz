// GET /api/batteries — Battery database with chemistry comparison
// Query params: chemistry (LFP, NMC, etc.)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chemistry = searchParams.get("chemistry");

  const where: Record<string, unknown> = {};
  if (chemistry) where.chemistry = { contains: chemistry }; // SQLite: no insensitive mode

  const batteries = await prisma.evBattery.findMany({
    where,
    include: {
      evModel: {
        select: {
          brand: true,
          model: true,
          variant: true,
          slug: true,
          powertrain: true,
          pricePkrMin: true,
        },
      },
    },
    orderBy: { capacityKwh: "desc" },
  });

  // Group by chemistry type for comparison
  const byChemistry: Record<string, typeof batteries> = {};
  for (const b of batteries) {
    const key = b.chemistry || "Unknown";
    if (!byChemistry[key]) byChemistry[key] = [];
    byChemistry[key].push(b);
  }

  // Chemistry comparison summary
  const chemistrySummary = {
    LFP: {
      pros: "Higher thermal stability, longer cycle life, cheaper, safer in heat",
      cons: "Lower energy density, heavier per kWh",
      bestFor: "Pakistan climate (hot weather), budget EVs, daily commuters",
    },
    NMC: {
      pros: "Higher energy density, lighter, better range per kg",
      cons: "More expensive, degrades faster in heat, needs better cooling",
      bestFor: "Performance EVs, long-range highway driving",
    },
    "LFP Blade": {
      pros: "All LFP advantages plus cell-to-pack design, excellent safety",
      cons: "BYD proprietary, limited repair options outside network",
      bestFor: "Best overall for Pakistan — safe, durable, heat-resistant",
    },
  };

  return NextResponse.json({
    count: batteries.length,
    batteries,
    byChemistry,
    chemistrySummary,
  });
}
