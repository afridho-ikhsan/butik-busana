import apiClient from "@/lib/api/client";

export const authService = {
  register: async (data: { email: string; password: string; nickname: string }) => {
    const res = await apiClient.post("/auth/register", data);
    return res.data;
  },
};
