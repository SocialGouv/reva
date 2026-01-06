"use client";

import { toDate } from "date-fns";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";

import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";
import { isDropOutConfirmed } from "@/utils/dropOutHelper";

import { useCandidacies } from "./candidacies.hook";

const INACTIF_PATHS = ["/candidacy-inactif", "/candidacy-deleted"];
const END_ACCOMPAGNEMENT_PATHS = ["/end-accompagnement"];
const DROP_OUT_DECISION_PATHS = [
  "/candidacy-dropout-decision",
  "/dropout-confirmation",
];
const INGNORED_PATHS = [
  ...INACTIF_PATHS,
  ...END_ACCOMPAGNEMENT_PATHS,
  ...DROP_OUT_DECISION_PATHS,
];

export default function CandidaciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { candidateId, candidacyId } = useParams<{
    candidateId: string;
    candidacyId?: string;
  }>();

  const pathname = usePathname();

  const router = useRouter();

  const { candidate, isLoading } = useCandidacies(candidateId);

  const candidacies = useMemo(() => candidate?.candidacies || [], [candidate]);

  const { isFeatureActive, status } = useFeatureFlipping();
  const isMultiCandidacyFeatureActive = isFeatureActive("MULTI_CANDIDACY");

  const inactifEnAttenteCandidacy = useMemo(() => {
    return candidacies.find(
      (candidacy) => candidacy.activite === "INACTIF_EN_ATTENTE",
    );
  }, [candidacies]);

  const endAccompagnementPendingCandidacy = useMemo(() => {
    return candidacies.find(
      (candidacy) => candidacy.endAccompagnementStatus === "PENDING",
    );
  }, [candidacies]);

  const dropOutPendingCandidacy = useMemo(() => {
    return candidacies.find(
      (candidacy) =>
        candidacy.candidacyDropOut &&
        !isDropOutConfirmed({
          dropOutConfirmedByCandidate:
            candidacy.candidacyDropOut.dropOutConfirmedByCandidate,
          proofReceivedByAdmin: candidacy.candidacyDropOut.proofReceivedByAdmin,
          dropOutDate: toDate(candidacy.candidacyDropOut.createdAt),
        }),
    );
  }, [candidacies]);

  useEffect(() => {
    if (status !== "INITIALIZED") {
      return;
    }

    if (INGNORED_PATHS.some((path) => pathname.includes(path))) {
      return;
    }

    if (inactifEnAttenteCandidacy) {
      router.push(
        `/candidates/${candidateId}/candidacies/${inactifEnAttenteCandidacy.id}/candidacy-inactif`,
      );

      return;
    } else if (endAccompagnementPendingCandidacy) {
      router.push(
        `/candidates/${candidateId}/candidacies/${endAccompagnementPendingCandidacy.id}/end-accompagnement`,
      );

      return;
    } else if (dropOutPendingCandidacy) {
      router.push(
        `/candidates/${candidateId}/candidacies/${dropOutPendingCandidacy.id}/candidacy-dropout-decision`,
      );

      return;
    }

    if (!isMultiCandidacyFeatureActive) {
      if (!candidacyId && candidacies.length > 0) {
        router.push(
          `/candidates/${candidateId}/candidacies/${candidacies[0].id}`,
        );
      }
    }
  }, [
    candidateId,
    candidacyId,
    candidacies,
    endAccompagnementPendingCandidacy,
    dropOutPendingCandidacy,
    inactifEnAttenteCandidacy,
    isMultiCandidacyFeatureActive,
    pathname,
    router,
    status,
  ]);

  if (isLoading) {
    return <LoaderWithLayout />;
  }

  if (isMultiCandidacyFeatureActive) {
    if (
      !candidacyId &&
      (inactifEnAttenteCandidacy ||
        endAccompagnementPendingCandidacy ||
        dropOutPendingCandidacy)
    ) {
      return <LoaderWithLayout />;
    }
  }

  if (!isMultiCandidacyFeatureActive) {
    if (!candidacyId && candidacies.length > 0) {
      return <LoaderWithLayout />;
    }
  }

  return children;
}
