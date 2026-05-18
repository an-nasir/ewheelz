import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = new Set(["PENDING", "ACTIVE", "SOLD", "EXPIRED"]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const body = await req.json().catch(() => null);
  const status = typeof body?.status === "string" ? body.status.toUpperCase() : null;
  const hasVerifiedSeller = typeof body?.verifiedSeller === "boolean";

  if (status !== null && !ALLOWED_STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid listing status" }, { status: 400 });
  }

  if (status === null && !hasVerifiedSeller) {
    return NextResponse.json({ error: "No valid listing update supplied" }, { status: 400 });
  }

  const listing = await prisma.listing.update({
    where: { id: params.id },
    data: {
      ...(status ? { status } : {}),
      ...(hasVerifiedSeller ? { verifiedSeller: body.verifiedSeller } : {}),
    },
    include: {
      evModel: { select: { brand: true, model: true, slug: true } },
    },
  }).catch((error: unknown) => {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return null;
    }

    throw error;
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, listing });
}
