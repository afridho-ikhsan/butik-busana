import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { orderSeed } from "./constants";
import { butikBusanaCollections, butikBusanaProductSeed } from "./butik-busana-products";

const prisma = new PrismaClient();

function slugify(raw: string): string {
  return raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function getVariantSalePrice(variant: {
  price: number;
  discountType?: "percent" | "amount";
  discountValue?: number;
}): number {
  const base = Number(variant.price) || 0;
  const discountType = variant.discountType ?? "amount";
  const discountValue = Number(variant.discountValue ?? 0) || 0;
  if (discountValue <= 0) return base;
  return discountType === "percent" ? base * (1 - discountValue / 100) : Math.max(0, base - discountValue);
}

function getProductTotalsFromVariants(
  variants: NonNullable<(typeof butikBusanaProductSeed)[number]["variants"]>
) {
  const prices = variants.map((variant) => Number(variant.price) || 0);
  const salePrices = variants.map((variant) => getVariantSalePrice(variant));
  const price = Math.min(...prices);
  const minSale = Math.min(...salePrices);
  return {
    price,
    discountedPrice: minSale < price ? minSale : price,
    quantity: variants.reduce((total, variant) => total + Math.max(0, Math.floor(Number(variant.quantity) || 0)), 0),
    weight: Number(variants[0]?.weight) || 0,
  };
}

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  const ownerRole = await prisma.role.upsert({
    where: { name: "owner" },
    update: {},
    create: { name: "owner" },
  });

  const customerRole = await prisma.role.upsert({
    where: { name: "customer" },
    update: {},
    create: { name: "customer" },
  });

  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@butik-busana.com" },
    update: {},
    create: {
      email: "admin@butik-busana.com",
      password: hashedPassword,
      nickname: "Admin",
      slug: "admin-butik-busana",
      roleId: adminRole.id,
      phones: ["081234567890"],
      addresses: [
        {
          addressLine: "Jl. Contoh No. 123",
          city: "Jakarta",
          province: "DKI Jakarta",
        },
      ],
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { roleId: adminRole.id },
  });

  const collectionSlugToId: Record<string, string> = {};

  for (const collection of butikBusanaCollections) {
    const savedCollection = await prisma.collection.upsert({
      where: { slug: collection.slug },
      update: {},
      create: {
        name: collection.name,
        slug: collection.slug,
        imageUrl: collection.imageUrl,
        numberOfProducts: 0,
      },
    });
    collectionSlugToId[collection.slug] = savedCollection.id;
  }

  let productsCreated = 0;
  let productsSkipped = 0;

  for (const product of butikBusanaProductSeed) {
    const name = product.name.trim();
    const slug = product.slug || slugify(name);
    if (!name || !slug) continue;

    const existingProduct = await prisma.product.findUnique({ where: { slug } });
    if (existingProduct) {
      productsSkipped++;
      continue;
    }

    const collectionIds = new Set<string>();
    const allProductsCollectionId = collectionSlugToId["all-products"];
    if (allProductsCollectionId) collectionIds.add(allProductsCollectionId);

    for (const collectionSlug of product.collections) {
      const collectionId = collectionSlugToId[collectionSlug];
      if (collectionId) collectionIds.add(collectionId);
    }

    const variants = product.variants ?? [];
    const totalsFromVariants =
      variants.length > 0 ? getProductTotalsFromVariants(variants) : null;

    await prisma.product.create({
      data: {
        name,
        slug,
        description: product.description,
        price: totalsFromVariants?.price ?? product.price,
        discountedPrice: totalsFromVariants?.discountedPrice ?? product.discountedPrice ?? 0,
        quantity: totalsFromVariants?.quantity ?? product.quantity,
        weight: totalsFromVariants?.weight ?? product.weight,
        brand: product.brand,
        media: product.imageUrls.map((url) => ({ type: "image", url })),
        variants,
        collectionIds: Array.from(collectionIds),
        additionalInfo: [],
      },
    });
    productsCreated++;
  }

  const allCollections = await prisma.collection.findMany();
  for (const col of allCollections) {
    const count = await prisma.product.count({
      where: { collectionIds: { has: col.id } },
    });
    await prisma.collection.update({
      where: { id: col.id },
      data: { numberOfProducts: count },
    });
  }

  const orderGroups = new Map<
    number,
    {
      orderNumber: string;
      items: { itemName: string; variant: string; qty: number; price: number; weight: number }[];
      shipping: { shippingRate: number; deliveryAddress: string; deliveryMethod: string; recipientName: string; recipientPhone: string };
      payment: { paymentStatus: string; total: number; paymentMethod: string };
      noteFromCustomer: string;
    }
  >();

  for (const row of orderSeed) {
    const key = row["Order number"] as number;
    const existing = orderGroups.get(key);
    const item = {
      itemName: (row.Item as string) || "",
      variant: (row.Variant as string) || "",
      qty: (row.Qty as number) || 1,
      price: (row.Price as number) || 0,
      weight: (row.Weight as number) || 0,
    };
    const shipping = {
      shippingRate: (row["Shipping rate"] as number) || 0,
      deliveryAddress: (row["Delivery address"] as string) || "",
      deliveryMethod: (row["Delivery method"] as string) || "",
      recipientName: (row["Recipient name"] as string) || "",
      recipientPhone: (row["Recipient phone"] as string) || "",
    };
    const payment = {
      paymentStatus: (row["Payment status"] as string) || "Unpaid",
      total: (row.Total as number) || 0,
      paymentMethod: (row["Payment method"] as string) || "",
    };
    const noteFromCustomer = (row["Note from customer"] as string) || "";

    if (existing) {
      existing.items.push(item);
    } else {
      orderGroups.set(key, {
        orderNumber: String(key),
        items: [item],
        shipping,
        payment,
        noteFromCustomer,
      });
    }
  }

  for (const o of orderGroups.values()) {
    const lineItems = o.items.map((it) => ({
      productName: it.variant ? `${it.itemName} (${it.variant})` : it.itemName,
      price: it.price,
      quantity: it.qty,
      weight: it.weight,
    }));
    const subtotal = o.items.reduce((sum, it) => sum + it.price * it.qty, 0);

    await prisma.order.upsert({
      where: { orderNumber: o.orderNumber },
      update: {},
      create: {
        orderNumber: o.orderNumber,
        userId: user.id,
        status: "APPROVED",
        paymentStatus: o.payment.paymentStatus === "Paid" ? "PAID" : "NOT_PAID",
        lineItems: lineItems as object[],
        subtotal,
        shippingCost: o.shipping.shippingRate,
        total: o.payment.total,
        recipientName: o.shipping.recipientName || undefined,
        recipientPhone: o.shipping.recipientPhone || undefined,
        address: o.shipping.deliveryAddress,
        layananKurir: o.shipping.deliveryMethod,
        catatan: o.noteFromCustomer || "",
        metodePembayaran: o.payment.paymentMethod || "",
      },
    });
  }

  const bankCount = await prisma.rekeningBank.count();
  if (bankCount === 0) {
    await prisma.rekeningBank.createMany({
      data: [
        {
          namaPenerima: "Ahmad Ibnu",
          jenisBank: "BCA",
          nomorRekening: "1234567890",
          gambarBank: "/bca-logo.png",
        },
        {
          namaPenerima: "Ahmad Ibnu",
          jenisBank: "BRI",
          nomorRekening: "0987654321",
          gambarBank: "/bri-logo.png",
        },
      ],
    });
  }

  await prisma.siteConfig.upsert({
    where: { key: "marqueeDuration" },
    update: {},
    create: { key: "marqueeDuration", value: "15" },
  });

  const marqueeCount = await prisma.marqueeItem.count();
  if (marqueeCount === 0) {
    await prisma.marqueeItem.createMany({
      data: [
        {
          text: "Selamat Datang di Butik Busana > Pusat Produk Branded Berkwalitas Harga Bersaing",
          sortOrder: 0,
        },
        { text: "Gratis Ongkir untuk pembelian di atas Rp 500.000", sortOrder: 1 },
      ],
    });
  }

  const sliderCount = await prisma.sliderSlide.count();
  if (sliderCount === 0) {
    await prisma.sliderSlide.createMany({
      data: [
        {
          imageUrl: "/banner1.webp",
          linkUrl: "https://www.butik-busana.com/products",
          sortOrder: 0,
        },
        {
          imageUrl: "/banner2.webp",
          linkUrl: "https://www.butik-busana.com/products",
          sortOrder: 1,
        },
      ],
    });
  }

  const productCount = await prisma.product.count();
  const orderCount = await prisma.order.count();
  console.log("Seed completed:", {
    roles: ["admin", "owner", "customer"],
    user: user.email,
    collections: allCollections.length,
    productsCreated,
    productsSkipped,
    productsTotal: productCount,
    orders: orderCount,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
