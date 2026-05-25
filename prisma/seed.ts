import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { orderSeed, productSeed } from "./constants";

const prisma = new PrismaClient();
const WIX_MEDIA_BASE = "https://static.wixstatic.com/media/";

function slugify(raw: string): string {
  return raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
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
    where: { email: "admin@toserbanet.com" },
    update: {},
    create: {
      email: "admin@toserbanet.com",
      password: hashedPassword,
      nickname: "Admin",
      slug: "admin-toserbanet",
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

  const allProductsCollection = await prisma.collection.upsert({
    where: { slug: "all-products" },
    update: {},
    create: {
      name: "Semua Produk",
      slug: "all-products",
      imageUrl: "/default-collection.jpg",
      numberOfProducts: 0,
    },
  });

  const jamTanganCollection = await prisma.collection.upsert({
    where: { slug: "jam-tangan" },
    update: {},
    create: {
      name: "Jam Tangan",
      slug: "jam-tangan",
      imageUrl: "/jam-tangan.jpg",
      numberOfProducts: 0,
    },
  });

  const kacamataCollection = await prisma.collection.upsert({
    where: { slug: "kacamata" },
    update: {},
    create: {
      name: "Kacamata",
      slug: "kacamata",
      imageUrl: "/kacamata.jpg",
      numberOfProducts: 0,
    },
  });

  const boxJamTanganCollection = await prisma.collection.upsert({
    where: { slug: "box-jam-tangan" },
    update: {},
    create: {
      name: "Box Jam Tangan",
      slug: "box-jam-tangan",
      imageUrl: "/box-jam-tangan.jpg",
      numberOfProducts: 0,
    },
  });

  const fashionCollection = await prisma.collection.upsert({
    where: { slug: "fashion" },
    update: {},
    create: {
      name: "Fashion",
      slug: "fashion",
      imageUrl: "/fashion.jpg",
      numberOfProducts: 0,
    },
  });

  const obatHerbalCollection = await prisma.collection.upsert({
    where: { slug: "obat-herbal" },
    update: {},
    create: {
      name: "Obat Herbal",
      slug: "obat-herbal",
      imageUrl: "/obat-herbal.jpg",
      numberOfProducts: 0,
    },
  });

  const jamDindingCollection = await prisma.collection.upsert({
    where: { slug: "jam-dinding" },
    update: {},
    create: {
      name: "Jam Dinding",
      slug: "jam-dinding",
      imageUrl: "/jam-dinding.jpg",
      numberOfProducts: 0,
    },
  });

  const collectionNameToId: Record<string, string> = {
    "Jam Tangan": jamTanganCollection.id,
    Kacamata: kacamataCollection.id,
    "Box Jam Tangan": boxJamTanganCollection.id,
    Fashion: fashionCollection.id,
    "Obat Herbal": obatHerbalCollection.id,
    "Jam Dinding": jamDindingCollection.id,
  };

  for (const p of productSeed) {
    const name = String(p.name || "").trim();
    if (!name) continue;
    const slug = slugify(name);
    if (!slug) continue;
    const priceNum = typeof p.price === "number" ? p.price : parseFloat(String(p.price || "0")) || 0;
    const collectionNames = (p.collection || "")
      .split(";")
      .map((c) => c.trim())
      .filter(Boolean);

    const collectionIds = new Set<string>();
    collectionIds.add(allProductsCollection.id);
    for (const name of collectionNames) {
      const id = collectionNameToId[name];
      if (id) collectionIds.add(id);
    }

    const discountedPrice =
      p.discountMode === "PERCENT" && p.discountValue && typeof p.discountValue === "number" && p.discountValue > 0
        ? priceNum * (1 - p.discountValue / 100)
        : 0;

    const productImageStr =
      typeof p.productImageUrl === "string"
        ? p.productImageUrl
        : Array.isArray(p.productImageUrl)
          ? (p.productImageUrl as string[]).join(";")
          : "";
    const media =
      productImageStr
        .split(";")
        .map((f) => f.trim())
        .filter(Boolean)
        .map((file) => ({
          type: "image",
          url: `${WIX_MEDIA_BASE}${file}`,
        })) || [];

    const additionalInfo: { title: string; value: string }[] = [];
    for (let i = 1; i <= 6; i++) {
      const title = (p as Record<string, unknown>)[
        `additionalInfoTitle${i}`
      ] as string;
      const desc = (p as Record<string, unknown>)[
        `additionalInfoDescription${i}`
      ] as string;
      if (title && desc) {
        const cleanUrl = stripHtml(desc);
        if (cleanUrl && ["tokopedia", "shopee", "tiktok"].includes(title.toLowerCase())) {
          additionalInfo.push({ title: title.toLowerCase(), value: cleanUrl });
        }
      }
    }

    const skuRaw = (p as Record<string, unknown>).sku;
    const sku = typeof skuRaw === "string" && skuRaw.trim() ? skuRaw.trim() : undefined;
    const brandRaw = (p as Record<string, unknown>).brand;
    const brand = typeof brandRaw === "string" && brandRaw.trim() ? brandRaw.trim() : undefined;

    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name,
        slug,
        description: p.description || "",
        price: priceNum,
        discountedPrice,
        quantity: Math.max(0, Math.floor(p.inventory || 0)),
        weight:
          typeof p.weight === "number"
            ? p.weight
            : parseFloat(String(p.weight || "0")) || 0,
        sku,
        brand,
        media,
        collectionIds: Array.from(collectionIds),
        additionalInfo,
      },
    });
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
          namaPenerima: "PT TOSERBANET",
          jenisBank: "BCA",
          nomorRekening: "1234567890",
          gambarBank: "/bca-logo.png",
        },
        {
          namaPenerima: "PT TOSERBANET",
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
          text: "Selamat Datang di Toserbanet.com > Pusat Produk Branded Berkwalitas Harga Bersaing",
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
          linkUrl: "https://www.toserbanet.com/products",
          sortOrder: 0,
        },
        {
          imageUrl: "/banner2.webp",
          linkUrl: "https://www.toserbanet.com/products",
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
    products: productCount,
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
