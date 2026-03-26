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

    const { evId, action } = await req.json();

    if (!evId) {
      return new NextResponse("Missing EV ID", { status: 400 });
    }

    if (action === "save") {
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          savedEVs: {
            connect: { id: evId }
          }
        }
      });
    } else {
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          savedEVs: {
            disconnect: { id: evId }
          }
        }
      });
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("SAVE_EV_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
