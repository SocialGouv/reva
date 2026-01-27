"use client";

import { usePathname } from "next/navigation";

const FULL_WIDTH_PATHS = [
  "/login",
  "/register",
  "/register-confirmation",
  "/reset-password",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isFullWidthPath = FULL_WIDTH_PATHS.some(
    (path) => pathname === path || pathname === `${path}/`,
  );

  if (isFullWidthPath) {
    return (
      <div className="fr-container flex-1 md:mt-4 pt-4 md:pt-8 md:pb-8 mb-12">
        {children}
      </div>
    );
  }

  return children;
}
