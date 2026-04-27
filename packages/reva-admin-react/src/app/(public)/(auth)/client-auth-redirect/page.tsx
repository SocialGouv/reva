"use client";

import { redirect, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { sanitizeRedirectUrl } from "@/utils/url";

export default function ClientAuthRedirectPage() {
  const { authenticated } = useKeycloakContext();
  const searchParams = useSearchParams();
  const redirectAfterAuthUrl = searchParams.get("redirectAfterAuthUrl");

  useEffect(() => {
    if (authenticated) {
      redirect(sanitizeRedirectUrl(redirectAfterAuthUrl) ?? "/");
    }
  }, [authenticated, redirectAfterAuthUrl]);

  return null;
}
