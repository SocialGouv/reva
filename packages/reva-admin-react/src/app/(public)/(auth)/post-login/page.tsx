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

  const { authenticated, authenticating, refreshAuth } = useKeycloakContext();
  const { isCertificationAuthority, isCertificationRegistryManager } =
    useAuth();

  const refreshTriggeredRef = useRef(false);

  const redirectAfterAuthUrl = searchParams.get("redirectAfterAuthUrl");

  useEffect(() => {
    if (authenticating) return;

    if (authenticated) {
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

    // Cookies fraichement posés par /login (server action) : la nav soft de
    // Next.js ne remonte pas KeycloakProvider. On déclenche une seule fois un
    // re-init pour qu'il relise les cookies. Si l'init reste non-authentifié,
    // on redirige vers /login au prochain passage de l'effect.
    if (!refreshTriggeredRef.current) {
      refreshTriggeredRef.current = true;
      refreshAuth();
      return;
    }

    router.replace("/login");
  }, [
    authenticated,
    authenticating,
    redirectAfterAuthUrl,
    isCertificationAuthority,
    isCertificationRegistryManager,
    router,
    refreshAuth,
  ]);

  return null;
};

export default PostLoginPage;
