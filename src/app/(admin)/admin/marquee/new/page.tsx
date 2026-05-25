import MarqueeForm from "@/components/admin/marquee-form";
import Link from "next/link";
import { Button } from "antd";
import { RollbackOutlined } from "@ant-design/icons";

export default function NewMarqueePage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/marquee">
          <Button icon={<RollbackOutlined />}>
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold mb-0">Tambah Marquee</h1>
      </div>
      <MarqueeForm />
    </div>
  );
}
