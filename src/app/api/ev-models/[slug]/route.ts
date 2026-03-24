// GET /api/ev-models/:slug — Full EV detail with structured JSON
// Returns complete specs, battery, charging, reviews for a single model
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const model = await prisma.evModel.findUnique({
    where: { slug: params.slug },
    include: {
      specs: true,
      battery: true,
      charging: true,
      reviews: {
        include: {
          author: {
            select: { name: true, city: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: { listings: true, reviews: true },
      },
    },
  });

  if (!model) {
    return NextResponse.json(
      { error: "EV model not found" },
      { status: 404 }
    );
  }

  // Build structured JSON-LD for AI/SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${model.brand} ${model.model}${model.variant ? ` ${model.variant}` : ""}`,
    brand: { "@type": "Brand", name: model.brand },
    model: model.model,
    vehicleEngine: {
      "@type": "EngineSpecification",
      fuelType: model.powertrain,
    },
    driveWheelConfiguration: model.specs?.driveType,
    speed: model.specs?.topSpeed
      ? { "@type": "QuantitativeValue", value: model.specs.topSpeed, unitCode: "KMH" }
      : undefined,
    fuelEfficiency: model.specs?.efficiencyWhKm
      ? `${model.specs.efficiencyWhKm} Wh/km`
      : undefined,
  };

  return NextResponse.json({
    data: model,
    jsonLd,
  });
}
