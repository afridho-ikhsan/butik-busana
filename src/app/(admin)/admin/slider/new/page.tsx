import SliderForm from "@/components/admin/slider-form";
import Link from "next/link";
import { Button } from "antd";
import { RollbackOutlined } from "@ant-design/icons";

export default function NewSliderPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/slider">
          <Button icon={<RollbackOutlined />}>
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold mb-0">Tambah Slider</h1>
      </div>
      <SliderForm />
    </div>
  );
}
