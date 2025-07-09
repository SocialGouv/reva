"use client";

import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PostLoginPage() {
  const searchParams = useSearchParams();
  const tokens = searchParams.get("tokens");
  const { resetKeycloakInstance, authenticated } = useKeycloakContext();
  const [ready, setReady] = useState(false);

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
    if (ready && authenticated) {
      redirect("/");
    }
  }, [ready, authenticated]);
}
