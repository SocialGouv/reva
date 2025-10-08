import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

import { useAuth } from "@/components/auth/auth.hooks";
import { useKeycloakContext } from "@/components/auth/keycloak.context";
import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";

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
      router.push("/");
    } else if (!authenticated && !isUnauthenticatedPath) {
      router.push("/login");
    }
  }, [authenticated, isUnauthenticatedPath, router, token]);

  const canRender =
    (isUnauthenticatedPath && !authenticated) ||
    (!isUnauthenticatedPath && authenticated);

  if (canRender) {
    return children;
  }

  return <LoaderWithLayout />;
};
