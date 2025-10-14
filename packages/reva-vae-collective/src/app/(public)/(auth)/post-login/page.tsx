"use client";

import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth";
import { useKeycloakContext } from "@/components/auth/keycloakContext";

export default function PostLoginPage() {
  const searchParams = useSearchParams();
  const tokens = searchParams.get("tokens");
  const commanditaireVaeCollectiveId = searchParams.get(
    "commanditaireVaeCollectiveId",
  );
  const redirectAfterLogin = searchParams.get("redirectAfterLogin");

  const { resetKeycloakInstance, authenticated } = useKeycloakContext();
  const [ready, setReady] = useState(false);
  const { isVAECollectiveManager, isAdmin } = useAuth();

  const decodedToken: {
    accessToken: string;
    refreshToken: string;
    idToken: string;
  } = JSON.parse(tokens || "{}");

  useEffect(() => {
    if (!ready) {
      resetKeycloakInstance(decodedToken);
      setReady(true);
    }
  }, [resetKeycloakInstance, decodedToken, ready]);

  useEffect(() => {
    if (ready && authenticated && redirectAfterLogin) {
      if (isVAECollectiveManager) {
        redirect(`/commanditaires/${commanditaireVaeCollectiveId}/cohortes`);
      }

      if (isAdmin) {
        redirect("/commanditaires");
      }
    }
  }, [
    ready,
    authenticated,
    isVAECollectiveManager,
    isAdmin,
    commanditaireVaeCollectiveId,
    redirectAfterLogin,
  ]);
}
