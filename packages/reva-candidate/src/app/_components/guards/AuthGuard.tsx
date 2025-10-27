import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCallback, useEffect } from "react";

import { useAuth } from "@/components/auth/auth.hooks";
import { useKeycloakContext } from "@/components/auth/keycloak.context";
import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";
import { usePreviousPath } from "@/components/previous-path/previousPath";

const UNAUTHENTICATED_PATHS = [
  "/login-confirmation",
  "/login",
  "/logout-confirmation",
  "/forgot-password",
  "/reset-password",
];

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const { loginWithToken } = useAuth();
  const { authenticated } = useKeycloakContext();
  const { previousPath, setPreviousPath } = usePreviousPath();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const token = params.get("token");
  const isUnauthenticatedPath = UNAUTHENTICATED_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  const handleTokenLogin = useCallback(
    async (token: string) => {
      try {
        const response = await loginWithToken.mutateAsync({ token });
        if (response.candidate_loginWithToken) {
          window.location.replace(response.candidate_loginWithToken);
          return;
        }
      } catch (error) {
        console.error(error);
      }

      router.push("/login");
    },
    [loginWithToken, router],
  );

  useEffect(() => {
    if (token) {
      handleTokenLogin(token);
    }

    // This page is loaded from link with token value
    // It must pass on useEffect only on first render

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (token) {
      return;
    }

    if (authenticated && isUnauthenticatedPath) {
      router.push(previousPath || "/");
    } else if (!authenticated && !isUnauthenticatedPath) {
      // put the previous path only if the candidacyId is in the pathname
      setPreviousPath(candidacyId ? pathname : undefined);
      router.push("/login");
    }
  }, [
    authenticated,
    isUnauthenticatedPath,
    pathname,
    router,
    setPreviousPath,
    token,
    previousPath,
    candidacyId,
  ]);

  const canRender =
    (isUnauthenticatedPath && !authenticated) ||
    (!isUnauthenticatedPath && authenticated);

  if (!canRender) {
    return <LoaderWithLayout />;
  }

  return children;
};
