// src/app/api/listings/[id]/sold/route.ts
// PATCH — marks a listing as sold. Requires the sellerToken issued at create time.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { soldPrice, sellerToken } = await req.json();

  if (!sellerToken) {
    return NextResponse.json({ error: "Missing seller token" }, { status: 401 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (listing.sellerToken !== sellerToken) {
    return NextResponse.json({ error: "Invalid seller token" }, { status: 403 });
  }

  await prisma.listing.update({
    where: { id: params.id },
    data: {
      status: "SOLD",
      description: soldPrice ? `[SOLD:${soldPrice}]` : listing.description,
    } as any,
  });

  return NextResponse.json({ ok: true });
}
