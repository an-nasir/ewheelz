import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { stationId, action } = await req.json();

    if (!stationId) {
      return new NextResponse("Missing Station ID", { status: 400 });
    }

    if (action === "save") {
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          savedStations: {
            connect: { id: stationId }
          }
        }
      });
    } else {
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          savedStations: {
            disconnect: { id: stationId }
          }
        }
      });
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("SAVE_STATION_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
