import { usePathname } from "next/navigation";

import { LayoutNotice } from "./LayoutNotice";
import { WhiteBoxContainer } from "./WhiteBoxContainer";

const UNAUTHENTICATED_PATHS = [
  "/login-confirmation",
  "/login",
  "/logout-confirmation",
  "/forgot-password",
  "/reset-password",
];
export const MainContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isRootPath = pathname === "/";
  const isUnAuthenticatedPath = UNAUTHENTICATED_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  const className = isUnAuthenticatedPath
    ? "flex flex-col flex-1 max-w-2xl"
    : "flex flex-col flex-1";

  return (
    <main
      role="main"
      id="content"
      className="flex flex-col flex-1 lg:bg-candidate"
    >
      <div className={className}>
        <LayoutNotice />
        {isRootPath ? (
          <div className="fr-container flex-1 md:mt-4 pt-4 md:pt-8 md:pb-8 fr-grid-row mb-12">
            {children}
          </div>
        ) : (
          <WhiteBoxContainer>{children}</WhiteBoxContainer>
        )}
      </div>
    </main>
  );
};
