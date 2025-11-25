import { toDate } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";
import { isDropOutConfirmed } from "@/utils/dropOutHelper";

import { useCandidacyGuard } from "./CandidacyGuard.hook";

const INACTIF_PATHS = ["/candidacy-inactif", "/candidacy-deleted"];
const END_ACCOMPAGNEMENT_PATHS = ["/end-accompagnement"];
const DROP_OUT_DECISION_PATHS = ["/candidacy-dropout-decision"];

export const CandidacyGuard = ({ children }: { children: React.ReactNode }) => {
  const { candidacy, isLoading, isError } = useCandidacyGuard();

  const router = useRouter();

  const pathname = usePathname();

  if (isLoading) {
    return <LoaderWithLayout />;
  }

  if (isError) {
    return <p>Vous n'avez pas accès à cette candidature</p>;
  }

  const isInactifEnAttente = candidacy?.activite === "INACTIF_EN_ATTENTE";

  const isEndAccompagnementPending =
    candidacy?.endAccompagnementStatus === "PENDING";

  const isDropOutPending =
    candidacy?.candidacyDropOut &&
    !isDropOutConfirmed({
      dropOutConfirmedByCandidate:
        candidacy.candidacyDropOut.dropOutConfirmedByCandidate,
      proofReceivedByAdmin: candidacy.candidacyDropOut.proofReceivedByAdmin,
      dropOutDate: toDate(candidacy.candidacyDropOut.createdAt),
    });

  if (
    isInactifEnAttente &&
    !INACTIF_PATHS.some((path) => pathname.includes(path))
  ) {
    router.push(
      `/candidates/${candidacy?.candidate?.id}/candidacies/${candidacy?.id}/candidacy-inactif`,
    );
  } else if (
    isEndAccompagnementPending &&
    !END_ACCOMPAGNEMENT_PATHS.some((path) => pathname.includes(path)) &&
    !INACTIF_PATHS.some((path) => pathname.includes(path))
  ) {
    router.push(
      `/candidates/${candidacy?.candidate?.id}/candidacies/${candidacy?.id}/end-accompagnement`,
    );
  } else if (
    isDropOutPending &&
    !DROP_OUT_DECISION_PATHS.some((path) => pathname.includes(path)) &&
    !END_ACCOMPAGNEMENT_PATHS.some((path) => pathname.includes(path)) &&
    !INACTIF_PATHS.some((path) => pathname.includes(path))
  ) {
    router.push(
      `/candidates/${candidacy?.candidate?.id}/candidacies/${candidacy?.id}/candidacy-dropout-decision`,
    );
  }

  return children;
};
