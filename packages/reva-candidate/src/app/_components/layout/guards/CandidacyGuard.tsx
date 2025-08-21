import { redirect, usePathname } from "next/navigation";
import React from "react";

import { useLayout } from "../layout.hook";

export const CandidacyGuard = ({ children }: { children: React.ReactNode }) => {
  const { candidate } = useLayout();
  const pathname = usePathname();

  const isInactifEnAttente =
    candidate?.candidacy?.activite === "INACTIF_EN_ATTENTE";

  if (
    isInactifEnAttente &&
    !pathname.startsWith("/candidacy-inactif") &&
    !pathname.startsWith("/candidacy-deleted")
  ) {
    redirect("/candidacy-inactif");
  }

  return children;
};
