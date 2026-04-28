"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

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

  const { authenticated } = useKeycloakContext();
  const { isCertificationAuthority, isCertificationRegistryManager } =
    useAuth();

  const redirectAfterAuthUrl = searchParams.get("redirectAfterAuthUrl");

  useEffect(() => {
    if (!authenticated) {
      router.replace("/login");
      return;
    }

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
    authenticated,
    redirectAfterAuthUrl,
    isCertificationAuthority,
    isCertificationRegistryManager,
    router,
  ]);

  return null;
};

export default PostLoginPage;
