import RekeningForm from "@/components/admin/rekening-form";
import { RollbackOutlined } from "@ant-design/icons";
import Link from "next/link";
import { Button } from "antd";

export default function NewRekeningPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/rekening-bank" className="text-slate-600 hover:text-slate-800">
          <Button icon={<RollbackOutlined />}>
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold mb-0">Tambah Rekening Bank</h1>
      </div>
      <RekeningForm />
    </div>
  );
}
  