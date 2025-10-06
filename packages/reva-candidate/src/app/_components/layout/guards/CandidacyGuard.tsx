import { redirect, usePathname } from "next/navigation";
import React from "react";

import { useLayout } from "../layout.hook";

const INACTIF_PATHS = ["/candidacy-inactif", "/candidacy-deleted"];

const END_ACCOMPAGNEMENT_PATHS = ["/end-accompagnement"];

export const CandidacyGuard = ({ children }: { children: React.ReactNode }) => {
  const { candidate, isEndAccompagnementPending } = useLayout();
  const pathname = usePathname();

  const isInactifEnAttente =
    candidate?.candidacy?.activite === "INACTIF_EN_ATTENTE";

  if (
    isInactifEnAttente &&
    !INACTIF_PATHS.some((path) => pathname.startsWith(path))
  ) {
    redirect("/candidacy-inactif");
  } else if (
    isEndAccompagnementPending &&
    !END_ACCOMPAGNEMENT_PATHS.some((path) => pathname.startsWith(path)) &&
    !INACTIF_PATHS.some((path) => pathname.startsWith(path))
  ) {
    redirect("/end-accompagnement");
  }

  return children;
};
