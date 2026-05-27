import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ lineItems: [], subtotal: 0 }, { status: 200 });
    }
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });
    const lineItems = (cart?.lineItems as object[]) || [];
    const subtotal = lineItems.reduce((acc: number, item: { price?: number; quantity?: number }) => {
      return acc + (item.price || 0) * (item.quantity || 0);
    }, 0);
    return NextResponse.json({
      lineItems,
      subtotal: { amount: subtotal.toString() },
      currency: "IDR",
    });
  } catch (error) {
    console.error("Cart API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Harap login terlebih dahulu" },
        { status: 401 }
      );
    }
    const body = await req.json();
    const { productId, variantId, variantName, quantity, productLink, product } = body;

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    const newLineItem = {
      _id: `cart-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      productId,
      variantId: variantId || null,
      variantName: variantName || null,
      quantity,
      productLink: productLink || null,
      productName: product?.name || "",
      price: product?.discountedPrice || product?.price || 0,
      image: (product?.media?.[0] as { url?: string })?.url || "",
      physicalProperties: { weight: product?.weight || 0 },
      catalogReference: {
        appId: "butik-busana",
        catalogItemId: productId,
        options: { productLink, variantId, variantName },
      },
    };

    const existingItems = ((cart?.lineItems as object[]) || []) as {
      _id: string;
      productId?: string;
      variantId?: string;
      quantity?: number;
    }[];
    const existingIdx = existingItems.findIndex(
      (i) => i.productId === productId && i.variantId === (variantId || null)
    );

    let updatedItems: object[];
    if (existingIdx >= 0) {
      updatedItems = existingItems.map((item, idx) =>
        idx === existingIdx
          ? { ...item, quantity: (item.quantity || 0) + quantity }
          : item
      );
    } else {
      updatedItems = [...existingItems, newLineItem];
    }

    await prisma.cart.upsert({
      where: { userId: session.user.id },
      update: { lineItems: updatedItems },
      create: {
        userId: session.user.id,
        lineItems: updatedItems,
      },
    });

    const newCart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      cart: {
        lineItems: newCart?.lineItems || updatedItems,
        subtotal: {
          amount: updatedItems
            .reduce(
              (acc: number, i: { price?: number; quantity?: number }) =>
                acc + (i.price || 0) * (i.quantity || 0),
              0
            )
            .toString(),
        },
      },
    });
  } catch (error) {
    console.error("Cart add error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Harap login terlebih dahulu" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    const deleteAll = searchParams.get("all") === "true";

    if (deleteAll) {
      await prisma.cart.update({
        where: { userId: session.user.id },
        data: { lineItems: [] },
      });
      return NextResponse.json({ cart: { lineItems: [] } });
    }

    if (!itemId) {
      return NextResponse.json(
        { error: "itemId diperlukan" },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });
    const items = ((cart?.lineItems as object[]) || []) as {
      _id: string;
      price?: number;
      quantity?: number;
    }[];
    const updatedItems = items.filter((i) => i._id !== itemId);

    await prisma.cart.update({
      where: { userId: session.user.id },
      data: { lineItems: updatedItems },
    });

    const amount = updatedItems.reduce(
      (acc, i) => acc + (i.price || 0) * (i.quantity || 0),
      0
    );

    return NextResponse.json({
      cart: {
        lineItems: updatedItems,
        subtotal: { amount: amount.toString() },
      },
    });
  } catch (error) {
    console.error("Cart delete error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}

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
    const { itemId, quantity } = body;

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });
    const items = ((cart?.lineItems as object[]) || []) as {
      _id: string;
      price?: number;
      quantity?: number;
    }[];
    const updatedItems = items.map((i) =>
      i._id === itemId ? { ...i, quantity } : i
    );

    await prisma.cart.update({
      where: { userId: session.user.id },
      data: { lineItems: updatedItems },
    });

    return NextResponse.json({
      cart: {
        lineItems: updatedItems,
        subtotal: {
          amount: updatedItems
            .reduce(
              (acc: number, i: { price?: number; quantity?: number }) =>
                acc + (i.price || 0) * (i.quantity || 0),
              0
            )
            .toString(),
        },
      },
    });
  } catch (error) {
    console.error("Cart update error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
