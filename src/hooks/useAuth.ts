"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  const login = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) throw new Error("Email atau password salah");
    return result;
  };

  const logout = async () => {
    await signOut();
  };

  return {
    session,
    user: session?.user,
    isLoggedIn: !!session?.user,
    isLoading: status === "loading",
    login,
    logout,
  };
}
