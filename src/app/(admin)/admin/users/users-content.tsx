"use client";

import { DataTable } from "@/components/admin/data-table";
import { UserActions } from "@/components/admin/user-actions";
import { formatDate } from "@/utils/date-formatter";

interface UserWithRole {
  id: string;
  email: string;
  nickname: string | null;
  slug: string;
  createdAt: Date;
  roleName: string;
  roleId: string | null;
}

interface UsersContentProps {
  users: UserWithRole[];
  total: number;
  page: number;
  limit: number;
  roles: { id: string; name: string }[];
  basePath: string;
}

export function UsersContent({ users, total, page, limit, roles, basePath }: UsersContentProps) {
  return (
    <DataTable
      data={users as unknown as Record<string, unknown>[]}
      total={total}
      page={page}
      limit={limit}
      basePath={basePath}
      searchKey="search"
      filterOptions={[
        {
          key: "role",
          label: "Role",
          options: [{ value: "", label: "Semua" }, ...roles.map((r) => ({ value: r.name, label: r.name }))],
        },
      ]}
      sortOptions={[
        { value: "createdAt-desc", label: "Terbaru" },
        { value: "createdAt-asc", label: "Terlama" },
        { value: "nickname-asc", label: "Nama A-Z" },
        { value: "nickname-desc", label: "Nama Z-A" },
      ]}
      actions={(item) => (
        <UserActions
          user={item as unknown as UserWithRole}
          roles={roles}
          currentRoleId={(item as unknown as UserWithRole).roleId}
        />
      )}
      columns={[
        { key: "email", header: "Email" },
        { key: "nickname", header: "Nama" },
        { key: "slug", header: "Slug" },
        {
          key: "roleName",
          header: "Role",
          render: (item) => {
            const u = item as unknown as UserWithRole;
            return (
              <span
                className={`px-2 py-1 rounded text-xs ${
                  u.roleName === "admin" || u.roleName === "owner"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {u.roleName}
              </span>
            );
          },
        },
        {
          key: "createdAt",
          header: "Terdaftar",
          render: (item) => formatDate((item as unknown as UserWithRole).createdAt),
        },
      ]}
      idKey="id"
    />
  );
}
