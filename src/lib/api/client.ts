import axios from "axios";

const apiClient = axios.create({
  baseURL: typeof window !== "undefined" ? "/api" : `${process.env.NEXT_PUBLIC_APP_URL}/api` || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const cookies = document.cookie.split("; ");
    const sessionCookie = cookies.find((c) => c.startsWith("next-auth.session-token="));
    if (sessionCookie) {
      config.headers.Cookie = sessionCookie;
    }
  }
  return config;
});

export default apiClient;
