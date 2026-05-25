import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (role !== "admin" && role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { duration } = body as { duration: number };
    const value = Math.max(1, Math.min(120, Math.round(duration) || 5));

    await prisma.siteConfig.upsert({
      where: { key: "sliderDuration" },
      update: { value: String(value) },
      create: { key: "sliderDuration", value: String(value) },
    });

    return NextResponse.json({ success: true, duration: value });
  } catch (error) {
    console.error("Admin slider settings:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
