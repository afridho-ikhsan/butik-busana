"use client";

import LoginButton from "./login-button";
import UserDropdown from "./user-dropdown";
import { useSession } from "next-auth/react";
import { Skeleton } from "./ui/skeleton";

function LoginElements() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;

  if (status === "loading") {
    return (
      <Skeleton className="w-8 bg-slate-300/50 aspect-square rounded-full hidden lg:block" />
    );
  }

  if (!isLoggedIn) {
    return <LoginButton className="hidden lg:flex" />;
  }

  return (
    <div className="hidden lg:flex items-center gap-1">
      <UserDropdown />
    </div>
  );
}

export default LoginElements;
