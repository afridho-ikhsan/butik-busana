import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (role !== "admin" && role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, slug, imageUrl } = body;

    const collection = await prisma.collection.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Admin collection create:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
