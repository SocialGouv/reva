"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { useAuth } from "@/components/auth/auth";
import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { sanitizeRedirectUrl } from "@/utils/url";

const DEFAULT_REDIRECT_BY_ROLE = {
  certificationAuthority: "/candidacies/annuaire",
  certificationRegistryManager: "/responsable-certifications",
  default: "/candidacies",
} as const;

const PostLoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { authenticated, resetKeycloakInstance } = useKeycloakContext();
  const { isCertificationAuthority, isCertificationRegistryManager } =
    useAuth();

  const initRef = useRef(false);
  const redirectedRef = useRef(false);

  const tokensParam = searchParams.get("tokens");
  const redirectAfterAuthUrl = searchParams.get("redirectAfterAuthUrl");

  // Hydrate Keycloak avec les tokens passes en URL par /login. Lecture
  // synchrone depuis searchParams : pas de dependance au timing Set-Cookie
  // serveur -> document.cookie qui posait probleme en production.
  useEffect(() => {
    if (initRef.current || !tokensParam) return;
    initRef.current = true;
    try {
      resetKeycloakInstance(JSON.parse(tokensParam));
    } catch {
      // Tokens invalides : on laisse le 2e useEffect rediriger vers /login
    }
  }, [tokensParam, resetKeycloakInstance]);

  useEffect(() => {
    if (redirectedRef.current) return;

    if (authenticated) {
      redirectedRef.current = true;
      const safeRedirect = sanitizeRedirectUrl(redirectAfterAuthUrl);
      if (safeRedirect) {
        router.replace(safeRedirect);
        return;
      }

      if (isCertificationAuthority) {
        router.replace(DEFAULT_REDIRECT_BY_ROLE.certificationAuthority);
      } else if (isCertificationRegistryManager) {
        router.replace(DEFAULT_REDIRECT_BY_ROLE.certificationRegistryManager);
      } else {
        router.replace(DEFAULT_REDIRECT_BY_ROLE.default);
      }
      return;
    }

    // Pas de tokens en URL et pas authentifie via SSO/check-sso : kick.
    if (!tokensParam) {
      redirectedRef.current = true;
      router.replace("/login");
    }
    // tokens en URL et pas encore authentifie : init en cours, on attend.
  }, [
    authenticated,
    tokensParam,
    redirectAfterAuthUrl,
    isCertificationAuthority,
    isCertificationRegistryManager,
    router,
  ]);

  return null;
};

export default PostLoginPage;
