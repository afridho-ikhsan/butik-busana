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
    const { namaPenerima, jenisBank, nomorRekening, gambarBank } = body;

    const bank = await prisma.rekeningBank.create({
      data: {
        namaPenerima,
        jenisBank,
        nomorRekening,
        gambarBank: gambarBank || null,
      },
    });

    return NextResponse.json(bank);
  } catch (error) {
    console.error("Admin rekening create:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
