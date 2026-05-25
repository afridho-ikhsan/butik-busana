"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AntdProvider } from "./antd-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider refetchWhenOffline={false}>
      <QueryClientProvider client={queryClient}>
        <AntdProvider>{children}</AntdProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
