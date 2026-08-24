"use client";

import { redirect, useParams } from "next/navigation";
import { ReactNode } from "react";

import { useAuth } from "@/components/auth/auth";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";

const LegalInformationLayout = ({ children }: { children: ReactNode }) => {
  const { "maison-mere-id": maisonMereAAPId } = useParams<{
    "maison-mere-id": string;
  }>();
  const { isFeatureActive, status } = useFeatureflipping();
  const { isAdmin, isGestionnaireMaisonMereAAP } = useAuth();

  if (
    (status === "INITIALIZED" &&
      !isFeatureActive("MAISON_MERE_GENERAL_INFORMATION_UPDATE")) ||
    (!isAdmin && !isGestionnaireMaisonMereAAP)
  ) {
    redirect(`/agencies-settings-v3/${maisonMereAAPId}/general-information`);
  }

  return <>{children}</>;
};

export default LegalInformationLayout;
