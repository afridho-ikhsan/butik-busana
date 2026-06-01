import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { endpoint, keys, guestKey } = body as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
      guestKey?: string;
    };

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: "endpoint dan keys wajib" },
        { status: 400 }
      );
    }

    const userAgent = req.headers.get("user-agent") ?? undefined;
    const userId = session?.user?.id;

    if (!userId && !guestKey) {
      return NextResponse.json({ error: "guestKey wajib" }, { status: 400 });
    }

    if (userId && guestKey) {
      await prisma.pushSubscription.updateMany({
        where: { guestKey },
        data: { userId },
      });
    }

    if (userId) {
      await prisma.pushSubscription.deleteMany({
        where: { userId, endpoint: { not: endpoint } },
      });
    } else if (guestKey) {
      await prisma.pushSubscription.deleteMany({
        where: { guestKey, endpoint: { not: endpoint } },
      });
    }

    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    });

    const keyData = {
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent,
    };

    if (existing) {
      if (userId) {
        await prisma.pushSubscription.update({
          where: { endpoint },
          data: { userId, ...keyData },
        });
      } else {
        await prisma.pushSubscription.update({
          where: { endpoint },
          data: { guestKey: guestKey!, ...keyData },
        });
      }
    } else if (userId) {
      await prisma.pushSubscription.create({
        data: { userId, endpoint, ...keyData },
      });
    } else {
      await prisma.pushSubscription.create({
        data: { guestKey: guestKey!, endpoint, ...keyData },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push subscribe error:", error);
    return NextResponse.json(
      {
        error: "Terjadi kesalahan",
        detail:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}
