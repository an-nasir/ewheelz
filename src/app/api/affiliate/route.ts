import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { evModelId, dealerName } = await request.json();

    await prisma.affiliateLink.updateMany({
      where: { evModelId, dealerName },
      data: { clicks: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Affiliate tracking error:", error);
    return NextResponse.json({ error: "Failed to track click" }, { status: 500 });
  }
}
