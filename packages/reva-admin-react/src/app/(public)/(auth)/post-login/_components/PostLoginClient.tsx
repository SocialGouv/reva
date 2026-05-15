"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { useAuth } from "@/components/auth/auth";
import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { sanitizeRedirectUrl } from "@/utils/url";

import type { Tokens } from "@/components/auth/keycloak.utils";

const DEFAULT_REDIRECT_BY_ROLE = {
  certificationAuthority: "/candidacies/annuaire",
  certificationRegistryManager: "/responsable-certifications",
  default: "/candidacies",
} as const;

type PostLoginClientProps = {
  // Absents en cas d'impersonation : on s'appuie alors sur le check-sso de
  // KeycloakProvider.
  tokens?: Tokens;
  redirectAfterAuthUrl?: string;
};

const PostLoginClient = ({
  tokens,
  redirectAfterAuthUrl,
}: PostLoginClientProps) => {
  const router = useRouter();
  const { authenticated, resetKeycloakInstance } = useKeycloakContext();
  const { isCertificationAuthority, isCertificationRegistryManager } =
    useAuth();

  const initRef = useRef(false);
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    if (tokens) {
      resetKeycloakInstance(tokens);
    }
  }, [tokens, resetKeycloakInstance]);

  useEffect(() => {
    if (redirectedRef.current) return;

    if (authenticated) {
      redirectedRef.current = true;
      const safeRedirect = sanitizeRedirectUrl(redirectAfterAuthUrl ?? null);
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
    } else if (!tokens) {
      // Pas de tokens injectes ni de session SSO recuperable : fallback login.
      redirectedRef.current = true;
      router.replace("/login");
    }
  }, [
    authenticated,
    tokens,
    redirectAfterAuthUrl,
    isCertificationAuthority,
    isCertificationRegistryManager,
    router,
  ]);

  return null;
};

export default PostLoginClient;
