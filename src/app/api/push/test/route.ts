import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { sendPushToGuestKey, sendPushToUser } from "@/lib/push";

function pushTestAllowed() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.PUSH_TEST_ENABLED === "true"
  );
}

export async function POST(req: NextRequest) {
  if (!pushTestAllowed()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const session = await getServerSession(authOptions);
    const body = await req.json().catch(() => ({}));
    const guestKey =
      typeof body.guestKey === "string" ? body.guestKey : undefined;
    const userId = session?.user?.id;

    if (!userId && !guestKey) {
      return NextResponse.json(
        { error: "Login atau aktifkan notifikasi sebagai tamu dulu" },
        { status: 400 }
      );
    }

    if (userId) {
      const subscriptionCount = await prisma.pushSubscription.count({
        where: { userId },
      });
      if (subscriptionCount === 0) {
        return NextResponse.json(
          { error: "Aktifkan notifikasi terlebih dahulu" },
          { status: 400 }
        );
      }
      await sendPushToUser(userId, {
        title: "Test Push",
        body: "Notifikasi uji coba dari Butik Busana",
        url: "/",
        tag: "push-test",
      });
      return NextResponse.json({ success: true, subscriptionCount });
    }

    const subscriptionCount = await prisma.pushSubscription.count({
      where: { guestKey },
    });
    if (subscriptionCount === 0) {
      return NextResponse.json(
        { error: "Aktifkan notifikasi terlebih dahulu" },
        { status: 400 }
      );
    }
    await sendPushToGuestKey(guestKey!, {
      title: "Test Push",
      body: "Notifikasi uji coba dari Butik Busana",
      url: "/",
      tag: "push-test",
    });

    return NextResponse.json({ success: true, subscriptionCount });
  } catch (error) {
    console.error("Push test error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
