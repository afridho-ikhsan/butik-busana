import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

const GUEST_EMAIL = "guest@butik-busana.system";
const GUEST_SLUG = "guest-butik-busana";

export async function getOrCreateGuestUser() {
  const hashedPassword = await bcrypt.hash(
    `guest-${Date.now()}-${Math.random().toString(36)}`,
    10
  );
  const user = await prisma.user.upsert({
    where: { email: GUEST_EMAIL },
    update: {},
    create: {
      email: GUEST_EMAIL,
      password: hashedPassword,
      slug: GUEST_SLUG,
      nickname: "Guest",
    },
  });
  return user;
}
