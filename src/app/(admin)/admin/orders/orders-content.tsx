"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import { Modal, Button, Tag, Card, Space, Flex } from "antd";
import { DataTable } from "@/components/admin/data-table";
import { rupiahFormatter } from "@/utils/number-formatter";
import { formatDate } from "@/utils/date-formatter";
import { PaymentStatus } from "@prisma/client";

interface OrderWithUser {
  id: string;
  orderNumber: string;
  total: number;
  paymentStatus: string;
  status: string;
  createdAt: Date;
  user: { email?: string | null; nickname?: string | null };
  paymentEvidences?: { id: string; linkBuktiPembayaran: string; namaFoto: string }[];
}

interface OrdersContentProps {
  orders: OrderWithUser[];
  total: number;
  page: number;
  limit: number;
  basePath: string;
}

export function OrdersContent({ orders, total, page, limit, basePath }: OrdersContentProps) {
  const router = useRouter();
  const [preview, setPreview] = useState<{
    orderId: string;
    orderNumber: string;
    url: string;
    paymentStatus: PaymentStatus | null;
  } | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    if (!preview) return;
    setIsApproving(true);
    try {
      const res = await fetch(`/api/admin/orders/${preview.orderId}/approve`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error();
      toast.success("Pembayaran disetujui");
      setPreview(null);
      router.refresh();
    } catch {
      toast.error("Gagal menyetujui pembayaran");
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <>
      <DataTable
        data={orders as unknown as Record<string, unknown>[]}
        total={total}
        page={page}
        limit={limit}
        basePath={basePath}
        searchKey="search"
        filterOptions={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "", label: "Semua" },
              { value: "APPROVED", label: "Disetujui" },
              { value: "CANCELED", label: "Dibatalkan" },
            ],
          },
          {
            key: "paymentStatus",
            label: "Pembayaran",
            options: [
              { value: "", label: "Semua" },
              { value: "PAID", label: "Sudah Bayar" },
              { value: "NOT_PAID", label: "Belum Bayar" },
            ],
          },
        ]}
        sortOptions={[
          { value: "createdAt-desc", label: "Terbaru" },
          { value: "createdAt-asc", label: "Terlama" },
          { value: "total-desc", label: "Total Tertinggi" },
          { value: "total-asc", label: "Total Terendah" },
        ]}
        columns={[
          {
            key: "orderNumber",
            header: "No. Order",
            render: (item) => {
              const o = item as unknown as OrderWithUser;
              return (
                <Link href={`/admin/orders/${o.id}`} className="text-blue-500 hover:underline">
                  #{o.orderNumber}
                </Link>
              );
            },
          },
          {
            key: "user",
            header: "Pembeli",
            render: (item) => {
              const u = (item as unknown as OrderWithUser).user;
              return (
                <div>
                  <p className="font-medium">{u?.nickname}</p>
                  <p className="text-xs text-slate-500">{u?.email}</p>
                </div>
              );
            },
          },
          {
            key: "total",
            header: "Total",
            render: (item) => rupiahFormatter.format((item as unknown as OrderWithUser).total),
          },
          {
            key: "status",
            header: "Status",
            render: (item) => {
              const o = item as unknown as OrderWithUser;
              return (
                <Tag color={o.status === "CANCELED" ? "default" : "blue"}>
                  {o.status}
                </Tag>
              );
            },
          },
          {
            key: "createdAt",
            header: "Tanggal",
            render: (item) => formatDate((item as unknown as OrderWithUser).createdAt),
          },
          {
            key: "paymentStatus",
            header: "Pembayaran",
            align: "center",
            render: (item) => {
              const o = item as unknown as OrderWithUser;
              return (
                <Tag color={o.paymentStatus === "PAID" ? "green" : "red"}>
                  {o.paymentStatus === "PAID" ? "Sudah Bayar" : "Belum"}
                </Tag>
              );
            },
          },
          {
            key: "paymentEvidence",
            header: "Bukti Pembayaran",
            render: (item) => {
              const o = item as unknown as OrderWithUser;
              const evidence = o.paymentEvidences && o.paymentEvidences[0];
              if (!evidence) {
                return <span className="text-xs text-red-500">Belum diunggah</span>;
              }

              const url = evidence.linkBuktiPembayaran.includes("midtrans") && evidence.linkBuktiPembayaran.includes("pdf")
                ? `/api/admin/orders/${o.id}/invoice`
                : evidence.linkBuktiPembayaran;

              return (
                <Button
                  type="primary"
                  size="middle"
                  onClick={() =>
                    setPreview({
                      orderId: o.id,
                      orderNumber: o.orderNumber,
                      url,
                      paymentStatus: o.paymentStatus as PaymentStatus,
                    })
                  }
                >
                  Lihat Bukti
                </Button>
              );
            },
          },
        ]}
        idKey="id"
      />

      <Modal
        open={!!preview}
        title={preview ? `Bukti Pembayaran #${preview.orderNumber}` : undefined}
        onCancel={() => setPreview(null)}
        footer={[
          ...(preview?.paymentStatus === PaymentStatus.PAID ? [
            <Space orientation="vertical" className="w-full" key="paid">
              <div key="approve" className="p-2 bg-green-600 text-white flex justify-center items-center">
                Pembayaran telah disetujui
              </div>
              <Button onClick={() => setPreview(null)} className="w-full">
                Tutup
              </Button>,
            </Space>
          ] : [
            <Flex gap='middle' className="w-full" justify="end" key="not-paid">
              <Button key="close" onClick={() => setPreview(null)}>
                Tutup
              </Button>
              {
                preview?.paymentStatus === PaymentStatus.NOT_PAID &&
                <Button
                  key="approve"
                  type="primary"
                  loading={isApproving}
                  onClick={handleApprove}
                >
                  Approve Pembayaran
                </Button>
              }
            </Flex>
          ]),
        ]}
      >
        {preview && (
          <Space orientation="vertical" className="w-full">
            {preview.url.includes("/invoice") ? (
              <div className="w-full min-h-[400px] flex flex-col gap-2">
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Buka Invoice PDF di tab baru
                </a>
                <iframe
                  src={preview.url}
                  title="Invoice"
                  className="w-full h-[60vh] min-h-[400px] rounded border border-slate-200"
                />
              </div>
            ) : (
              <div className="relative w-full aspect-video bg-slate-100 rounded">
                <Image
                  src={preview.url}
                  alt="Bukti pembayaran"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 512px"
                />
              </div>
            )}
          </Space>
        )}
      </Modal>
    </>
  );
}
