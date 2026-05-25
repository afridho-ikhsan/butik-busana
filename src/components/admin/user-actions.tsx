"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface UserActionsProps {
  user: { id: string; roleName: string };
  roles: { id: string; name: string }[];
  currentRoleId: string | null;
}

export function UserActions({ user, roles, currentRoleId }: UserActionsProps) {
  const router = useRouter();
  const [roleId, setRoleId] = useState(currentRoleId || "");

  useEffect(() => {
    setRoleId(currentRoleId || "");
  }, [currentRoleId]);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateRole = async () => {
    if (!roleId) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId }),
      });
      if (!res.ok) throw new Error();
      toast.success("Role berhasil diubah");
      router.refresh();
    } catch {
      toast.error("Gagal mengubah role");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={roleId}
        onChange={(e) => setRoleId(e.target.value)}
        className="text-sm px-2 py-1 border border-slate-300 rounded"
      >
        <option value="">Ubah Role</option>
        {roles.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
      {roleId && (
        <button
          onClick={handleUpdateRole}
          disabled={isUpdating}
          className="text-blue-500 hover:text-blue-700 text-sm disabled:opacity-50"
        >
          Simpan
        </button>
      )}
    </div>
  );
}
