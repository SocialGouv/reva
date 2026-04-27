"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth";
import { removeTokens } from "@/components/auth/keycloak.utils";
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

  const [tokensHydrated, setTokensHydrated] = useState(false);

  const rawTokens = searchParams.get("tokens");
  const redirectAfterAuthUrl = searchParams.get("redirectAfterAuthUrl");

  useEffect(() => {
    if (tokensHydrated) return;

    if (!rawTokens) {
      setTokensHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(rawTokens) as {
        accessToken: string;
        refreshToken: string;
        idToken: string;
      };
      resetKeycloakInstance(parsed);
    } catch {
      removeTokens();
      router.replace("/login");
      return;
    }
    setTokensHydrated(true);
  }, [rawTokens, resetKeycloakInstance, tokensHydrated, router]);

  useEffect(() => {
    if (!tokensHydrated || !authenticated) return;

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
  }, [
    tokensHydrated,
    authenticated,
    redirectAfterAuthUrl,
    isCertificationAuthority,
    isCertificationRegistryManager,
    router,
  ]);

  return null;
};

export default PostLoginPage;
