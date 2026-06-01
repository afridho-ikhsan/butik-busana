import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { endpoint, guestKey } = body as {
      endpoint?: string;
      guestKey?: string;
    };

    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json(
        { error: "endpoint wajib" },
        { status: 400 }
      );
    }

    const userId = session?.user?.id;

    if (userId) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint, userId },
      });
    } else if (guestKey) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint, guestKey },
      });
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push unsubscribe error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
