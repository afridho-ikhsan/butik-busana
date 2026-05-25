import apiClient from "@/lib/api/client";

export const authService = {
  login: async (email: string, password: string) => {
    const res = await fetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, redirect: false }),
    });
    if (!res.ok) throw new Error("Login gagal");
    return res.json();
  },
  register: async (data: { email: string; password: string; nickname: string }) => {
    const res = await apiClient.post("/auth/register", data);
    return res.data;
  },
  getSession: async () => {
    const res = await fetch("/api/auth/session");
    return res.json();
  },
  logout: async () => {
    const res = await fetch("/api/auth/signout", { method: "POST" });
    return res.json();
  },
};
