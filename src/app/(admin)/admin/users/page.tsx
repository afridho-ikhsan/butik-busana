import { prisma } from "@/lib/prisma";
import { UsersContent } from "./users-content";

const LIMIT = 10;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const roleFilter = params.role || "";
  const sort = params.sort || "createdAt-desc";
  const skip = (page - 1) * LIMIT;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { email: { contains: search } },
      { nickname: { contains: search } },
      { slug: { contains: search } },
    ];
  }
  if (roleFilter) {
    where.role = { name: roleFilter };
  }

  const [sortField, sortDir] = sort.split("-");
  const orderBy =
    sortField === "role"
      ? { role: { name: sortDir as "asc" | "desc" } }
      : { [sortField || "createdAt"]: sortDir === "asc" ? "asc" : "desc" };

  const [users, total, roles] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: LIMIT,
      orderBy,
      select: {
        id: true,
        email: true,
        nickname: true,
        slug: true,
        createdAt: true,
        role: { select: { id: true, name: true } },
      },
    }),
    prisma.user.count({ where }),
    prisma.role.findMany(),
  ]);

  const usersWithRole = users.map((u) => ({
    ...u,
    roleName: u.role?.name || "customer",
    roleId: u.role?.id || null,
  }));

  return (
    <div>
      <div className="flex gap-3 flex-row justify-between items-center mb-6 flex-wrap">
        <h1 className="text-2xl font-bold !m-0">Pengguna</h1>
      </div>
      <UsersContent
        users={usersWithRole}
        total={total}
        page={page}
        limit={LIMIT}
        roles={roles}
        basePath="/admin/users"
      />
    </div>
  );
}
