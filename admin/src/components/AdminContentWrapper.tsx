"use client";

import React from "react";
import { usePathname } from "next/navigation";

export function AdminContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) {
    return <main className="flex-1 w-full min-h-screen">{children}</main>;
  }

  return (
    <main className="flex-1 p-6 sm:p-10 overflow-y-auto w-full">
      {children}
    </main>
  );
}
