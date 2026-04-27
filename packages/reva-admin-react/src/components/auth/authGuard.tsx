"use client";
import { redirect, usePathname, useSearchParams } from "next/navigation";

import { useKeycloakContext } from "./keycloakContext";

const PUBLIC_PATHS = [
  "/login",
  "/post-login",
  "/client-auth-redirect",
  "/forgot-password",
  "/forgot-password-confirmation",
  "/reset-password",
  "/reset-password-confirmation",
  "/logout-confirmation",
  "/auth-error",
  "/plan-du-site",
] as const;

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { authenticated } = useKeycloakContext();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (authenticated) return <>{children}</>;

  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isPublicPath) return <>{children}</>;

  const search = searchParams?.toString();
  const redirectAfterAuthUrl = search ? `${pathname}?${search}` : pathname;
  redirect(
    `/login?redirectAfterAuthUrl=${encodeURIComponent(redirectAfterAuthUrl)}`,
  );
};
