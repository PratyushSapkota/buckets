"use client";

import { createContext, useContext } from "react";
import type { Session } from "next-auth";

type User = NonNullable<Session["user"]>;

const AuthContext = createContext<User | null>(null);

export function AuthProvider({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useUser() {
  const user = useContext(AuthContext);

  if (!user) {
    throw new Error("useUser must be used within AuthProvider");
  }

  return user;
}
