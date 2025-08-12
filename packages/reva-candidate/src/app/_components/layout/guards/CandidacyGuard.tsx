import React from "react";

import { useLayout } from "../layout.hook";

export const CandidacyGuard = ({ children }: { children: React.ReactNode }) => {
  const { candidate } = useLayout();

  const isInactifEnAttente =
    candidate?.candidacy.activite === "INACTIF_EN_ATTENTE";

  if (isInactifEnAttente) {
    return <div>Inactif en attente</div>;
  }

  return children;
};
