import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Harap login terlebih dahulu" },
        { status: 401 }
      );
    }
    const body = await req.json();
    const { nickname, phones, addresses, profilePhoto } = body;

    const updateData: {
      nickname?: string;
      profilePhoto?: string;
      phones?: string[];
      addresses?: object[];
    } = {};

    if (nickname !== undefined) updateData.nickname = nickname;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
    if (phones !== undefined) updateData.phones = phones;
    if (addresses !== undefined) {
      updateData.addresses = Array.isArray(addresses)
        ? addresses.map((a: { addressLine?: string }) => ({ addressLine: a?.addressLine || "" }))
        : [];
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({
      id: user.id,
      nickname: user.nickname,
      phones: user.phones,
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
