"use client";
import { useAuth } from "@/components/auth/auth";
import { redirect } from "next/navigation";
import { redirectCommanditaireVaeCollective } from "./actions";
import { useKeycloakContext } from "@/components/auth/keycloakContext";

export default function Home() {
  const { authenticated } = useKeycloakContext();
  const { isAdmin, isVAECollectiveManager } = useAuth();

  if (authenticated && isAdmin) {
    redirect("/commanditaires");
  }

  if (authenticated && isVAECollectiveManager) {
    redirectCommanditaireVaeCollective();
  }

  return null;
}
