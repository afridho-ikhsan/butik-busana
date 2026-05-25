import UserPage from "@/components/user/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getUserById } from "@/lib/data/user";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil Pengguna",
};

async function UserProfile({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await getUserById(session.user.id);
  if (!user) {
    redirect("/login");
  }

  const currentMember = {
    member: {
      _id: user.id,
      contactId: user.id,
      loginEmail: user.email,
      profile: {
        nickname: user.nickname || "",
        slug: user.slug,
        photo: { url: user.profilePhoto || "" },
      },
      contact: {
        phones: user.phones,
        addresses: (user.addresses as { addressLine?: string }[] || []).map(
          (a) => ({ addressLine: a?.addressLine || "" })
        ),
      },
    },
  };

  return <UserPage currentMember={currentMember} />;
}

export default UserProfile;
