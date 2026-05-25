import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import MarqueeForm from "@/components/admin/marquee-form";
import Link from "next/link";
import { Button } from "antd";
import { RollbackOutlined } from "@ant-design/icons";

export default async function EditMarqueePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.marqueeItem.findUnique({ where: { id } });

  if (!item) return notFound();

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/marquee">
          <Button icon={<RollbackOutlined />}>
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold mb-0  ">Edit Marquee</h1>
      </div>
      <MarqueeForm item={item} />
    </div>
  );
}
