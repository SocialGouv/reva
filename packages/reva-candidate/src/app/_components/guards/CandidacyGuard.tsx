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
    return <div>Vous n'avez pas accès à cette candidature</div>;
  }

  const isEndAccompagnementPending =
    candidacy?.endAccompagnementStatus === "PENDING";

  const isInactifEnAttente = candidacy?.activite === "INACTIF_EN_ATTENTE";

  if (
    isInactifEnAttente &&
    !INACTIF_PATHS.some((path) => pathname.includes(path))
  ) {
    redirect("./candidacy-inactif");
  } else if (
    isEndAccompagnementPending &&
    !END_ACCOMPAGNEMENT_PATHS.some((path) => pathname.includes(path)) &&
    !INACTIF_PATHS.some((path) => pathname.includes(path))
  ) {
    redirect("./end-accompagnement");
  }

  return children;
};
