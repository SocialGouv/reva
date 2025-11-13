import { redirect, usePathname } from "next/navigation";
import React from "react";

import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";

import { useCandidacyGuard } from "./CandidacyGuard.hook";

const INACTIF_PATHS = ["/candidacy-inactif", "/candidacy-deleted"];

const END_ACCOMPAGNEMENT_PATHS = ["/end-accompagnement"];

export const CandidacyGuard = ({ children }: { children: React.ReactNode }) => {
  const { candidacy, isLoading, isError } = useCandidacyGuard();

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

  if (
    isInactifEnAttente &&
    !INACTIF_PATHS.some((path) => pathname.includes(path))
  ) {
    redirect(
      `/candidates/${candidacy?.candidate?.id}/candidacies/${candidacy?.id}/candidacy-inactif`,
    );
  } else if (
    isEndAccompagnementPending &&
    !END_ACCOMPAGNEMENT_PATHS.some((path) => pathname.includes(path)) &&
    !INACTIF_PATHS.some((path) => pathname.includes(path))
  ) {
    redirect(
      `/candidates/${candidacy?.candidate?.id}/candidacies/${candidacy?.id}/end-accompagnement`,
    );
  }

  return children;
};
