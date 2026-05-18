import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = new Set(["NEW", "CONTACTED", "CONVERTED", "CLOSED"]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const body = await req.json().catch(() => null);
  const status = typeof body?.status === "string" ? body.status.toUpperCase() : "";

  if (!ALLOWED_STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid lead status" }, { status: 400 });
  }

  const lead = await prisma.lead.update({
    where: { id: params.id },
    data: { status },
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

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, lead });
}
