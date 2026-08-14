"use client";

import { redirect, useParams } from "next/navigation";
import { ReactNode } from "react";

import { useAuth } from "@/components/auth/auth";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";

// Garde de rôle explicite: le sous-arbre agencies-settings-v3 est aussi accessible
// au gestionnaire de la maison mère.
const LegalInformationLayout = ({ children }: { children: ReactNode }) => {
  const { "maison-mere-id": maisonMereAAPId } = useParams<{
    "maison-mere-id": string;
  }>();
  const { isAdmin } = useAuth();
  const { isFeatureActive, status } = useFeatureflipping();

  if (
    status === "INITIALIZED" &&
    (!isAdmin || !isFeatureActive("MAISON_MERE_GENERAL_INFORMATION_UPDATE"))
  ) {
    redirect(`/agencies-settings-v3/${maisonMereAAPId}/general-information`);
  }

  return <>{children}</>;
};

export default LegalInformationLayout;
