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
    const { name, slug, description, price, discountedPrice, quantity, weight, media, collectionIds, variants, additionalInfo } = body;

    const product = await prisma.product.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        description: description || "",
        price: parseFloat(price),
        discountedPrice: discountedPrice ? parseFloat(discountedPrice) : 0,
        quantity: parseInt(quantity) || 0,
        weight: parseFloat(weight) || 0,
        media: media || [],
        variants: variants || [],
        additionalInfo: additionalInfo || [],
        collectionIds: collectionIds || [],
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Admin product create:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
