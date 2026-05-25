"use client";

import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import apiClient from "@/lib/api/client";

interface UpdatedField {
  nickname?: string;
  phones?: string[];
  addresses?: { _id?: string; addressLine?: string }[];
}

function UpdateModal({
  modalTitle,
  modalDescription,
  inputError,
  handleClose,
  onSuccessTask,
  isOpen,
  userId,
  updatedField,
  children,
}: {
  inputError?: string | null;
  modalTitle: string;
  modalDescription?: string;
  handleClose: () => void;
  onSuccessTask: () => void;
  isOpen: boolean;
  userId: string;
  updatedField: UpdatedField;
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const modal = useOutsideClick(handleClose);

  const { mutate: handleSaveData, isPending } = useMutation({
    mutationKey: ["currentMember"],
    mutationFn: async () => {
      const payload: { nickname?: string; phones?: string[]; addresses?: object[] } = {};
      if (updatedField.nickname !== undefined) payload.nickname = updatedField.nickname;
      if (updatedField.phones !== undefined) payload.phones = updatedField.phones;
      if (updatedField.addresses !== undefined) {
        payload.addresses = updatedField.addresses.map((a) => ({
          addressLine: a.addressLine || "",
        }));
      }
      await apiClient.patch("/user/update", payload);
    },
    onError: () => {
      toast.error("Perubahan gagal");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentMember"] });
      toast.success("Data berhasil diperbarui");
      onSuccessTask();
    },
  });

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 ${
        isOpen ? "opacity-100 z-50" : "opacity-0 -z-10"
      } flex justify-center items-center transition-all cursor-pointer`}
    >
      <div
        className={`bg-white p-6 rounded-lg w-[80%] max-w-96 transition-all delay-75 cursor-default ${
          isOpen ? "-translate-y-0 opacity-100" : "translate-y-5 opacity-0"
        }`}
        ref={modal}
      >
        <h3
          className={`text-center lg:text-start text-base md:text-lg font-semibold ${
            !modalDescription ? "mb-4" : ""
          }`}
        >
          {modalTitle}
        </h3>
        {modalDescription && (
          <p className="text-slate-700 mb-4 text-sm">{modalDescription}</p>
        )}
        {children}
        {inputError && (
          <p className="text-sm text-red-500 mt-2">{inputError}</p>
        )}
        <div className="flex justify-end gap-3 mt-4">
          <button
            className="text-red-500 bg-red-300 p-2 rounded-md"
            onClick={handleClose}
          >
            Batal
          </button>
          <button
            className={`${
              isPending || inputError ? "cursor-not-allowed text-slate-500 bg-slate-200" : "text-blue-500 bg-blue-300"
            } p-3 rounded-md`}
            onClick={() => {
              if (inputError) return;
              handleSaveData();
            }}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default UpdateModal;
