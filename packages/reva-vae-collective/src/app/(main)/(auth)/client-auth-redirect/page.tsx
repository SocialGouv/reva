"use client";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useKeycloakContext } from "@/components/auth/keycloakContext";

export default function ClientAuthRedirectPage() {
  const { authenticated } = useKeycloakContext();
  const searchParams = useSearchParams();
  const redirectAfterAuthUrl = searchParams.get("redirectAfterAuthUrl");

  useEffect(() => {
    if (authenticated) {
      if (redirectAfterAuthUrl) {
        redirect(redirectAfterAuthUrl);
      } else {
        redirect("/");
      }
    }
  }, [authenticated, redirectAfterAuthUrl]);

  return null;
}
