// src/app/api/listings/[id]/sold/route.ts
// Marks a listing as sold + records final sale price for valuation model training

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { soldPrice } = await req.json();

  await prisma.listing.update({
    where: { id: params.id },
    data: {
      status: "SOLD",
      // Store sold price in description suffix so the valuation model can learn from it
      // (avoids schema change — replace with a proper soldPrice column when schema allows)
      description: soldPrice
        ? `[SOLD:${soldPrice}]`
        : undefined,
    } as any,
  });

  return NextResponse.json({ ok: true });
}
