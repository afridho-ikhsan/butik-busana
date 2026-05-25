"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { userService } from "@/services/user.service";

export default function useCurrentMember() {
  const { data: session, status } = useSession();

  const { data: contactData } = useQuery({
    queryKey: ["user-me"],
    queryFn: userService.getMe,
    enabled: !!session?.user,
  });

  const member = useMemo(() => {
    if (!session?.user) return null;
    return {
      _id: (session.user as { id?: string }).id,
      contactId: (session.user as { id?: string }).id,
      loginEmail: session.user?.email || "",
      role: (session.user as { role?: string }).role || "customer",
      profile: {
        nickname: session.user?.name || "",
        slug: (session.user as { slug?: string }).slug || "",
        photo: {
          url: session.user?.profileUrl || "",
        },
      },
      contact: {
        phones: contactData?.phones ?? [],
        addresses: contactData?.addresses ?? [],
      },
    };
  }, [session?.user, contactData]);

  return {
    member,
    isLoading: status === "loading",
    isLoggedIn: !!session?.user,
  };
}
