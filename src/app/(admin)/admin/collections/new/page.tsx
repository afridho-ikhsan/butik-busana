import CollectionForm from "@/components/admin/collection-form";
import { RollbackOutlined } from "@ant-design/icons";
import { Button } from "antd";
import Link from "next/link";

export default function NewCollectionPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/collections">
          <Button icon={<RollbackOutlined />}>
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold mb-0">Tambah Kategori</h1>
      </div>
      <CollectionForm />
    </div>
  );
}
