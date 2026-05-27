import ProductDetailContent from "@/components/product-detail/product-detail-content";
import { getProductBySlug } from "@/lib/data/products";
import Head from "next/head";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { JSDOM } from "jsdom";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const productId = decodeURIComponent((await params).productId);
  const product = await getProductBySlug(productId);

  if (!product) return { title: "Produk tidak ditemukan" };

  const dom = new JSDOM(product.description || "");
  const description =
    dom.window.document.querySelector("p")?.textContent || "";

  const media = (product.media as { url?: string }[] | null) || [];
  const mainImg = media[0];

  return {
    title: product.name,
    description: description || "Deskripsi produk tidak tersedia.",
    openGraph: {
      images: {
        url: mainImg?.url || "/default-image.jpg",
      },
      url: `${process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL}/products/${product.slug}`,
    },
  };
}

async function SinglePage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const productId = decodeURIComponent((await params).productId);
  const product = await getProductBySlug(productId);

  if (!product) return notFound();

  const additionalInfo = (product.additionalInfo as { title?: string; value?: string }[] | null) || [];
  const marketplaceLinks = additionalInfo.filter((info) =>
    ["tokopedia", "shopee", "tiktok"].includes(info.title || "")
  );

  const dom = new JSDOM(product.description || "");
  const description =
    dom.window.document.querySelector("p")?.textContent || "";

  const variantsList = ((product as { variants?: unknown }).variants as { name: string; price: number; weight: number; quantity: number; imageUrl?: string }[] | null) || [];

  const productData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    discountedPrice: product.discountedPrice ?? undefined,
    quantity: product.quantity,
    weight: product.weight,
    media: product.media,
    variants: variantsList,
    description: product.description,
  };

  const mediaItems = (product.media as { type?: string; url?: string }[]) || [];

  return (
    <>
      <Head>
        <title>Butik Busana | {product.name}</title>
        <meta name="description" content={description || "Deskripsi produk tidak tersedia."} />
        <meta property="og:title" content={product.name || ""} />
        <meta property="og:description" content={product.description || "Deskripsi produk tidak tersedia."} />
        <meta property="og:image" content={mediaItems.find((m) => m.type !== "video")?.url || mediaItems[0]?.url || "/default-image.jpg"} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL}/products/${product.slug}`} />
        {product.discountedPrice && (
          <meta property="product:price:amount" content={String(product.discountedPrice)} />
        )}
        <meta property="product:price:currency" content="IDR" />
      </Head>
      <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 relative flex flex-col lg:flex-row gap-8 lg:gap-16 pb-6 pt-6 lg:pt-10 min-h-[71.2vh]">
        <ProductDetailContent
          productName={product.name}
          productDescription={product.description || ""}
          mediaItems={mediaItems}
          marketplaceLinks={marketplaceLinks}
          productData={productData}
        />
      </div>
    </>
  );
}

export default SinglePage;
