"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import ConfirmationBox from "@/components/confirmation.box";
import { MdDelete } from "react-icons/md";
import { Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

interface DeleteButtonProps {
  id: string;
  deleteUrl: string;
  title: string;
  message: string;
  successMessage?: string;
  errorMessage?: string;
  className?: string;
  children?: React.ReactNode;
}

export function DeleteButton({
  id,
  deleteUrl,
  title,
  message,
  successMessage = "Berhasil dihapus",
  errorMessage = "Gagal menghapus",
  className = "text-red-500 hover:text-red-700 disabled:opacity-50",
  children,
}: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    confirmAlert({
      customUI: ({ onClose }: { onClose: () => void }) => (
        <ConfirmationBox
          icon={<MdDelete />}
          judul={title}
          pesan={message}
          onClose={onClose}
          onClickIya={async () => {
            setIsDeleting(true);
            try {
              const res = await fetch(`${deleteUrl}/${id}`, { method: "DELETE" });
              if (!res.ok) throw new Error();
              toast.success(successMessage);
              router.refresh();
            } catch {
              toast.error(errorMessage);
            } finally {
              setIsDeleting(false);
              onClose();
            }
          }}
          labelIya="Ya, Hapus"
          labelTidak="Batal"
          yesButtonClassName="bg-red-500 text-white"
        />
      ),
    });
  };

  return (
    <Button
      type="primary"
      danger
      icon={<DeleteOutlined />}
      onClick={handleDelete}
      disabled={isDeleting}
      className={className + ' text-white !hover:bg-red-700'} />
  );
}
