"use client";
import { useAuth } from "@/components/auth/auth";
import { redirect } from "next/navigation";
import { redirectCommanditaireVaeCollective } from "./actions";
import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { useEffect } from "react";

export default function Home() {
  const { authenticated } = useKeycloakContext();
  const { isAdmin, isVAECollectiveManager } = useAuth();

  useEffect(() => {
    if (authenticated && isAdmin) {
      redirect("/commanditaires");
    }

    if (authenticated && isVAECollectiveManager) {
      redirectCommanditaireVaeCollective();
    }
  }, [authenticated, isAdmin, isVAECollectiveManager]);

  return null;
}
