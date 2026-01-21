import { useParams, usePathname } from "next/navigation";

const UNAUTHENTICATED_PATHS = [
  "/login-confirmation",
  "/login",
  "/logout-confirmation",
  "/forgot-password",
  "/reset-password",
  "/register",
  "/register-confirmation",
];

const FULL_WIDTH_AUTH_PATHS = ["/login", "/register"];

export const MainContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { candidateId, candidacyId } = useParams<{
    candidateId?: string;
    candidacyId?: string;
  }>();

  const isTransparentPath =
    pathname === "/" ||
    pathname === `/candidates/` ||
    pathname === `/candidates/${candidateId}/` ||
    pathname === `/candidates/${candidateId}/candidacies/` ||
    pathname === `/candidates/${candidateId}/candidacies/${candidacyId}/` ||
    pathname === `/candidates/${candidateId}/candidacies/create/` ||
    pathname === `/candidates/${candidateId}/candidacies/certifications/` ||
    pathname.endsWith(`type-accompagnement/`) ||
    pathname.startsWith(
      `/candidates/${candidateId}/candidacies/create/vae-collective/`,
    );

  const isUnAuthenticatedPath = UNAUTHENTICATED_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  const isFullWidthAuthPath = FULL_WIDTH_AUTH_PATHS.some(
    (path) => pathname === path || pathname === `${path}/`,
  );

  if (isFullWidthAuthPath) {
    return (
      <main role="main" id="content" className="flex flex-col flex-1">
        {children}
      </main>
    );
  }

  const wrapperClassName = isUnAuthenticatedPath
    ? "fr-container flex flex-col flex-1 max-w-2xl"
    : "flex flex-col flex-1";

  return (
    <main
      role="main"
      id="content"
      className="flex flex-col flex-1 lg:bg-candidate"
    >
      <div className={wrapperClassName}>
        {isTransparentPath ? (
          <div className="fr-container flex-1 md:mt-4 pt-4 md:pt-8 md:pb-8 fr-grid-row mb-12">
            {children}
          </div>
        ) : (
          <div className="fr-container md:mt-8 pt-4 md:pt-4 md:pb-4 fr-grid-row mb-12 bg-white lg:shadow-lifted">
            {children}
          </div>
        )}
      </div>
    </main>
  );
};
