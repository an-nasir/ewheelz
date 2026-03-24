// GET /api/compare?slugs=byd-atto-3,mg-zs-ev — Compare 2-4 EV models
// Returns side-by-side specs, batteries, charging for comparison
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slugsParam = searchParams.get("slugs");

  if (!slugsParam) {
    return NextResponse.json(
      { error: "Provide ?slugs=slug1,slug2 (2-4 models)" },
      { status: 400 }
    );
  }

  const slugs = slugsParam.split(",").map((s) => s.trim()).filter(Boolean);

  if (slugs.length < 2 || slugs.length > 4) {
    return NextResponse.json(
      { error: "Compare requires 2-4 models" },
      { status: 400 }
    );
  }

  const models = await prisma.evModel.findMany({
    where: { slug: { in: slugs } },
    include: {
      specs: true,
      battery: true,
      charging: true,
    },
  });

  if (models.length < 2) {
    return NextResponse.json(
      { error: "Could not find enough models. Check slugs." },
      { status: 404 }
    );
  }

  // Build comparison highlights
  const highlights = buildHighlights(models);

  return NextResponse.json({
    count: models.length,
    models,
    highlights,
  });
}

// Extracts "best in category" comparisons
interface ModelWithSpecs {
  slug: string;
  brand: string;
  model: string;
  specs: {
    rangeWltp?: number | null;
    rangeRealWorld?: number | null;
    chargingDcKw?: number | null;
    accel0100?: number | null;
    motorPowerKw?: number | null;
    efficiencyWhKm?: number | null;
  } | null;
  battery: {
    chemistry?: string | null;
    capacityKwh?: number | null;
    warrantyYears?: number | null;
    cycleLife?: number | null;
  } | null;
  pricePkrMin?: number | null;
}

function buildHighlights(models: ModelWithSpecs[]) {
  const highlights: Record<string, { winner: string; value: string }> = {};

  // Best range
  const byRange = models
    .filter((m) => m.specs?.rangeWltp)
    .sort((a, b) => (b.specs?.rangeWltp || 0) - (a.specs?.rangeWltp || 0));
  if (byRange.length) {
    highlights.bestRange = {
      winner: `${byRange[0].brand} ${byRange[0].model}`,
      value: `${byRange[0].specs?.rangeWltp} km WLTP`,
    };
  }

  // Fastest charging
  const byCharging = models
    .filter((m) => m.specs?.chargingDcKw)
    .sort((a, b) => (b.specs?.chargingDcKw || 0) - (a.specs?.chargingDcKw || 0));
  if (byCharging.length) {
    highlights.fastestCharging = {
      winner: `${byCharging[0].brand} ${byCharging[0].model}`,
      value: `${byCharging[0].specs?.chargingDcKw} kW DC`,
    };
  }

  // Quickest acceleration
  const byAccel = models
    .filter((m) => m.specs?.accel0100)
    .sort((a, b) => (a.specs?.accel0100 || 99) - (b.specs?.accel0100 || 99));
  if (byAccel.length) {
    highlights.quickestAcceleration = {
      winner: `${byAccel[0].brand} ${byAccel[0].model}`,
      value: `${byAccel[0].specs?.accel0100}s 0-100`,
    };
  }

  // Best value (lowest price)
  const byPrice = models
    .filter((m) => m.pricePkrMin)
    .sort((a, b) => (a.pricePkrMin || Infinity) - (b.pricePkrMin || Infinity));
  if (byPrice.length) {
    highlights.bestValue = {
      winner: `${byPrice[0].brand} ${byPrice[0].model}`,
      value: `PKR ${((byPrice[0].pricePkrMin || 0) / 1000000).toFixed(1)}M`,
    };
  }

  // Most efficient
  const byEfficiency = models
    .filter((m) => m.specs?.efficiencyWhKm)
    .sort(
      (a, b) => (a.specs?.efficiencyWhKm || 999) - (b.specs?.efficiencyWhKm || 999)
    );
  if (byEfficiency.length) {
    highlights.mostEfficient = {
      winner: `${byEfficiency[0].brand} ${byEfficiency[0].model}`,
      value: `${byEfficiency[0].specs?.efficiencyWhKm} Wh/km`,
    };
  }

  return highlights;
}
