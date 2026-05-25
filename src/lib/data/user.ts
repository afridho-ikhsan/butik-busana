import { prisma } from "@/lib/prisma";

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      nickname: true,
      slug: true,
      profilePhoto: true,
      phones: true,
      addresses: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
