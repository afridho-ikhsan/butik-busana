import Image from "next/image";
import shopeeIcon from "@/assets/shopee.png";
import tokopediaIcon from "@/assets/tokopedia.png";
import tiktokIcon from "@/assets/tiktok.png";
import Link from "next/link";

interface MarketplaceLink {
  title?: string;
  value?: string;
}

function MarketplaceList({
  marketplaceLinks,
}: {
  marketplaceLinks: MarketplaceLink[];
}) {
  return (
    <div className="flex gap-3">
      {marketplaceLinks.map((item, i) => {
        const url = item.value || "";

        if (item.title === "tokopedia")
          return (
            <Link
              className="w-12 h-12 bg-slate-50 flex justify-center items-center rounded-full relative border-2 border-green-500 hover:bg-green-300 transition-all"
              href={url}
              key={i}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={tokopediaIcon}
                alt={`tokopedia ${url}`}
                className="object-cover w-6 h-6"
              />
            </Link>
          );
        if (item.title === "shopee")
          return (
            <Link
              className="w-12 h-12 bg-slate-50 flex justify-center items-center rounded-full relative border-2 border-orange-500 hover:bg-orange-200 transition-all"
              href={url}
              key={i}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={shopeeIcon}
                alt={`shopee ${url}`}
                className="object-cover w-10 h-10"
              />
            </Link>
          );
        if (item.title === "tiktok")
          return (
            <Link
              className="w-12 h-12 bg-slate-50 flex justify-center items-center rounded-full relative border-2 border-gray-500 hover:bg-gray-200 transition-all"
              href={url}
              key={i}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={tiktokIcon}
                alt={`Tiktok Marketplace ${url}`}
                className="object-cover w-10 h-10"
              />
            </Link>
          );

        return null;
      })}
    </div>
  );
}

export default MarketplaceList;
