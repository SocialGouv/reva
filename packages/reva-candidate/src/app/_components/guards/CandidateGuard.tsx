import { useParams, usePathname, useRouter } from "next/navigation";
import React from "react";

import { useAnonymousFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";

import { useCandidateGuard } from "./CandidateGuard.hook";

export const CandidateGuard = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isError, candidate } = useCandidateGuard();

  const pathname = usePathname();
  const router = useRouter();
  const { candidateId } = useParams<{ candidateId: string }>();

  const { isFeatureActive } = useAnonymousFeatureFlipping();

  const isCandidateProfileV2FeatureActive = isFeatureActive(
    "CANDIDATE_PROFILE_V2",
  );

  if (isLoading) {
    return <LoaderWithLayout />;
  }

  if (isError) {
    return <div>Vous n'avez pas accès à ce candidat</div>;
  }

  if (isCandidateProfileV2FeatureActive) {
    if (
      candidate &&
      (!candidate.civilInformationCompleted ||
        !candidate.contactInformationCompleted ||
        !candidate.typologyAndCollectiveAgreementCompleted) &&
      !pathname.includes("/first-connexion")
    ) {
      router.push(`/candidates/${candidateId}/first-connexion`);
      return <LoaderWithLayout />;
    }
  } else {
    if (
      candidate &&
      (!candidate.civilInformationCompleted ||
        !candidate.contactInformationCompleted) &&
      !pathname.includes("/first-connexion") &&
      !pathname.includes("/profile")
    ) {
      router.push(`/candidates/${candidateId}/first-connexion`);
      return <LoaderWithLayout />;
    }
  }

  return children;
};
