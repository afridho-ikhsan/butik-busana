"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type AdminSidebarContextValue = {
  openSidebar: () => void;
  register: (fn: () => void) => () => void;
};

const AdminSidebarContext = createContext<AdminSidebarContextValue>({
  openSidebar: () => {},
  register: () => () => {},
});

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const openRef = useRef<() => void>(() => {});

  const openSidebar = useCallback(() => {
    openRef.current();
  }, []);

  const register = useCallback((fn: () => void) => {
    openRef.current = fn;
    return () => {
      openRef.current = () => {};
    };
  }, []);

  return (
    <AdminSidebarContext.Provider value={{ openSidebar, register }}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  return useContext(AdminSidebarContext);
}
