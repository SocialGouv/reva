import {
  CandidacyStatusStep,
  CandidacyTypeAccompagnement,
} from "@prisma/client";

export const canCandidateUpdateCandidacy = async ({
  candidacy,
  userRoles,
}: {
  candidacy: {
    status: CandidacyStatusStep;
    typeAccompagnement: CandidacyTypeAccompagnement;
  };
  userRoles?: KeyCloakUserRole[];
}): Promise<boolean> => {
  // Bloquer le changement de certification si DF incomplet (sauf pour l'admin)
  if (
    candidacy.status === "DOSSIER_FAISABILITE_INCOMPLET" &&
    !userRoles?.includes("admin")
  ) {
    return false;
  }

  return (
    ["PROJET", "VALIDATION", "PRISE_EN_CHARGE", "PARCOURS_ENVOYE"].includes(
      candidacy.status,
    ) ||
    (candidacy.typeAccompagnement === "AUTONOME" &&
      candidacy.status === "DOSSIER_FAISABILITE_INCOMPLET")
  );
};
