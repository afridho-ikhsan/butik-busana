"use client";

import { toast } from "react-toastify";
import { MdOutlineContentCopy } from "react-icons/md";

function UserIdSection({ userId }: { userId: string }) {
  const handleCopy = (id: string) => {
    if (id) {
      navigator.clipboard
        .writeText(id)
        .then(() => {
          toast.success("Id berhasil dicopy ke clipboard mu");
        })
        .catch((err) => {
          console.error("Gagal saat copy userId: ", err);
        });
    }
  };

  return (
    <button
      className="col-span-4 flex justify-between gap-3 text-start"
      onClick={() => {
        handleCopy(userId);
      }}
    >
      <span>{userId}</span>
      <MdOutlineContentCopy className="flex-shrink-0" />
    </button>
  );
}

export default UserIdSection;
