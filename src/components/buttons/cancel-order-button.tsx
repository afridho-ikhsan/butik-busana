"use client";

import { cancelOrder } from "@/actions";
import { Button, Modal, Typography, message } from "antd";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

const { Text } = Typography;

function CancelOrderButton({
  orderId,
  orderNumber,
}: {
  orderId: string;
  orderNumber: string;
}) {
  const router = useRouter();

  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    Modal.confirm({
      title: "Batalkan pesanan?",
      icon: null,
      centered: true,
      width: 450,
      closable: true,
      content: (
        <Text>
          Pesanan #{orderNumber} akan dibatalkan dan tidak dapat dilanjutkan.
        </Text>
      ),
      okText: "Batalkan",
      cancelText: "Tutup",
      okButtonProps: { danger: true },
      onOk: async () => {
        const result = await cancelOrder(orderId);
        if (result?.success) {
          message.success("Pesanan berhasil dibatalkan");
          router.refresh();
          return;
        }
        message.error("Gagal membatalkan pesanan");
        return Promise.reject();
      },
    });
  };

  return (
    <Button
      type="default"
      size="small"
      onClick={handleClick}
      className="rounded-full z-10 border-slate-700 text-slate-700 hover:bg-slate-700 hover:text-slate-100 !p-3"
    >
      Batalkan
    </Button>
  );
}

export default CancelOrderButton;
