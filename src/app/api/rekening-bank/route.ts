import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const banks = await prisma.rekeningBank.findMany();
    return NextResponse.json(banks);
  } catch (error) {
    console.error("Rekening bank API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
