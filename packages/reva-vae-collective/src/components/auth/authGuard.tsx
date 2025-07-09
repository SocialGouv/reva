"use client";
import { redirect, usePathname } from "next/navigation";
import { useKeycloakContext } from "./keycloakContext";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { authenticated } = useKeycloakContext();
  const pathname = usePathname();

  const publicPaths = ["/login", "/post-login", "/logout-confirmation"];

  if (!authenticated && !publicPaths.includes(pathname)) {
    redirect("/login");
  }

  return children;
};
