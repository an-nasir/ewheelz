export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { prisma } = await import("@/lib/prisma");

  const model = await prisma.evModel.findUnique({
    where: { slug: params.slug },
    include: {
      specs: true,
      battery: true,
      charging: true,
      reviews: {
        include: { author: { select: { name: true, city: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { listings: true, reviews: true } },
    },
  });

  if (!model) {
    return NextResponse.json({ error: "EV model not found" }, { status: 404 });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${model.brand} ${model.model}${model.variant ? ` ${model.variant}` : ""}`,
    brand: { "@type": "Brand", name: model.brand },
    model: model.model,
    vehicleEngine: { "@type": "EngineSpecification", fuelType: model.powertrain },
    driveWheelConfiguration: (model.specs as Record<string,unknown>)?.driveType,
    speed: (model.specs as Record<string,unknown>)?.topSpeed
      ? { "@type": "QuantitativeValue", value: (model.specs as Record<string,unknown>).topSpeed, unitCode: "KMH" }
      : undefined,
    fuelEfficiency: (model.specs as Record<string,unknown>)?.efficiencyWhKm
      ? `${(model.specs as Record<string,unknown>).efficiencyWhKm} Wh/km`
      : undefined,
  };

  return NextResponse.json({ data: model, jsonLd });
}
