import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SliderForm from "@/components/admin/slider-form";
import Link from "next/link";
import { RollbackOutlined } from "@ant-design/icons";
import { Button } from "antd";

export default async function EditSliderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const slide = await prisma.sliderSlide.findUnique({ where: { id } });

  if (!slide) return notFound();

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/slider">
          <Button icon={<RollbackOutlined />}>
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold mb-0">Edit Slider</h1>
      </div>
      <SliderForm slide={slide} />
    </div>
  );
}
