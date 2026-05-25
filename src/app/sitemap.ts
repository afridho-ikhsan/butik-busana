import { getProducts } from "@/lib/data/products";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts({ limit: 1000 });

  const productEntries: MetadataRoute.Sitemap = products.map((item) => ({
    url: `${process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL}/products/${item.slug}`,
    lastModified: item.updatedAt || new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [
    {
      url: `${process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL}/`,
    },
    {
      url: `${process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL}/about`,
    },
    {
      url: `${process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL}/kontak`,
    },
    {
      url: `${process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL}/products`,
    },
    ...productEntries,
  ];
}
