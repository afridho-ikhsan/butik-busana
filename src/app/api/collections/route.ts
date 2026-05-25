import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(collections);
  } catch (error) {
    console.error("Collections API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
