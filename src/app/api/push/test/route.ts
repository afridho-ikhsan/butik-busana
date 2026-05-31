import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";

function pushTestAllowed() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.PUSH_TEST_ENABLED === "true"
  );
}

export async function POST() {
  if (!pushTestAllowed()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptionCount = await prisma.pushSubscription.count({
      where: { userId: session.user.id },
    });

    if (subscriptionCount === 0) {
      return NextResponse.json(
        { error: "Aktifkan notifikasi terlebih dahulu" },
        { status: 400 }
      );
    }

    await sendPushToUser(session.user.id, {
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
