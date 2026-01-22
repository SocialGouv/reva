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
import { REST_API_URL } from "@/config/config";

const UNAUTHENTICATED_PATHS = [
  "/login-confirmation",
  "/login",
  "/logout-confirmation",
  "/forgot-password",
  "/reset-password",
  "/register",
  "/register-confirmation",
];

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const { loginWithToken } = useAuth();
  const { authenticated, resetKeycloakInstance } = useKeycloakContext();
  const { previousPath, setPreviousPath } = usePreviousPath();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const token = params.get("token");
  const fc_code = params.get("fc_code");
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

  const handleFranceConnectComplete = useCallback(
    async (code: string) => {
      try {
        const res = await fetch(
          `${REST_API_URL}/account/franceconnect/tokens`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          },
        );
        if (!res.ok) throw new Error("Invalid or expired code");
        const tokens = await res.json();
        resetKeycloakInstance(tokens);
      } catch {
        router.push("/login");
      } finally {
        const nextParams = new URLSearchParams(params.toString());
        nextParams.delete("fc_code");
        const q = nextParams.toString();
        router.replace(pathname + (q ? `?${q}` : ""));
      }
    },
    [params, pathname, resetKeycloakInstance, router],
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
    if (fc_code) {
      handleFranceConnectComplete(fc_code);
    }
  }, [fc_code, handleFranceConnectComplete]);

  useEffect(() => {
    if (token || fc_code) {
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
    fc_code,
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
