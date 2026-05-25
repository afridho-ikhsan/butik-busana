import apiClient from "@/lib/api/client";

export type UserMeResponse = {
  phones: string[];
  addresses: { addressLine: string }[];
};

export const userService = {
  getMe: () =>
    apiClient.get<UserMeResponse>("/user/me").then((r) => r.data),
};
