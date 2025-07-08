"use client";

import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function PostLoginPage() {
  const searchParams = useSearchParams();
  const tokens = searchParams.get("tokens");
  const { resetKeycloakInstance } = useKeycloakContext();

  const decodedToken: {
    accessToken: string;
    refreshToken: string;
    idToken: string;
  } = JSON.parse(tokens || "{}");

  useEffect(() => {
    resetKeycloakInstance(decodedToken);
    redirect("/");
  }, [decodedToken, resetKeycloakInstance]);
}
