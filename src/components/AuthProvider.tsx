"use client";

import { SessionProvider } from "next-auth/react";

// The "default" keyword here is the magic fix!
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}