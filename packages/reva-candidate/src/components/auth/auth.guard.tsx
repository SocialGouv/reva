import { useCallback, useEffect } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PageLayout } from "@/layouts/page.layout";

import { Loader } from "../legacy/atoms/Icons";

import { useAuth } from "./auth.hooks";
import { useKeycloakContext } from "./keycloak.context";

const UNAUTHENTICATED_PATHS = [
  "/login-confirmation",
  "/login",
  "/login-v2",
  "/logout-confirmation",
  "/forgot-password",
  "/reset-password",
];

interface Props {
  children: (props: { authenticated: boolean }) => React.ReactNode;
}

export const AuthGuard = (props: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();

  const isAuthenticatedPath =
    UNAUTHENTICATED_PATHS.findIndex((path) => pathname.startsWith(path)) == -1;

  const { authenticated } = useKeycloakContext();

  const { loginWithToken } = useAuth();

  const token = params.get("token");

  const login = useCallback(
    async (token: string) => {
      try {
        const response = await loginWithToken.mutateAsync({ token });
        if (response.candidate_loginWithToken) {
          window.location.replace(response.candidate_loginWithToken);
        }
      } catch (error) {
        console.error(error);
        router.push("/login");
      }
    },
    [loginWithToken, router],
  );

  useEffect(() => {
    if (token) {
      login(token);
    }

    // This page is loaded from link with token value
    // It must pass on useEffect only on first render

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (authenticated && !isAuthenticatedPath) {
      router.push("/");
    } else if (!authenticated && isAuthenticatedPath) {
      router.push("/login");
    }
  }, [authenticated, isAuthenticatedPath, router]);

  if (
    token ||
    (authenticated && !isAuthenticatedPath) ||
    (!authenticated && isAuthenticatedPath)
  ) {
    return (
      <PageLayout
        data-test="auth-loading"
        className="flex-1 flex flex-col items-center justify-center"
      >
        {token && <h2>Connexion en cours</h2>}
        <div className="w-8">
          <Loader />
        </div>
      </PageLayout>
    );
  }

  const { children } = props;

  return children({ authenticated });
};
