import BestSellerProduct from "@/components/best-seller-product";
import NewReleaseProduct from "@/components/new-release-product";
import ProductCategory from "@/components/product-category";
import ShopService from "@/components/shop-service";
import Marquee from "@/components/marquee";
import Slider from "@/components/slider";
import { getMarqueeItems } from "@/lib/data/marquee";
import { getSliderSlides } from "@/lib/data/slider";
import { getMarqueeDuration, getSliderDuration } from "@/lib/data/site-config";

export const revalidate = 60

export default async function Home() {
  const [marqueeItems, sliderSlides, marqueeDuration, sliderDuration] = await Promise.all([
    getMarqueeItems(),
    getSliderSlides(),
    getMarqueeDuration(),
    getSliderDuration(),
  ]);

  return (
    <div className="pb-0">
      <Marquee items={marqueeItems} durationSeconds={marqueeDuration} />

      <Slider slides={sliderSlides} durationSeconds={sliderDuration} />

      {/* General Product Categori */}
      <ProductCategory />

      <div className="w-full container mx-auto">
        {/* List Produk Terlaris */}
        <BestSellerProduct />

        {/* List Produk Terbaru */}
        <NewReleaseProduct />
      </div>

      {/* Artikel */}
      {/* <ArticleList /> */}

      {/* Testimoni Pelanggan */}
      {/* <CustomerTestimoni /> */}

      {/* Layanan Toko Kami */}
      <ShopService />
    </div>
  );
}
