import { useParams, usePathname } from "next/navigation";

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

  const { candidateId } = useParams<{
    candidateId?: string;
  }>();

  const isRootPath =
    pathname === "/" ||
    pathname === `/candidates/` ||
    pathname === `/candidates/${candidateId}/`;

  const isUnAuthenticatedPath = UNAUTHENTICATED_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  const className = isUnAuthenticatedPath
    ? "fr-container flex flex-col flex-1 max-w-2xl"
    : "flex flex-col flex-1";

  return (
    <main
      role="main"
      id="content"
      className="flex flex-col flex-1 lg:bg-candidate"
    >
      <div className={className}>
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
