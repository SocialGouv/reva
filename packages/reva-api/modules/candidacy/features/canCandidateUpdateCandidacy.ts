import {
  CandidacyStatusStep,
  CandidacyTypeAccompagnement,
} from "@prisma/client";

import { isFeatureActiveForUser } from "@/modules/feature-flipping/feature-flipping.features";

export const canCandidateUpdateCandidacy = async ({
  candidacy,
  userKeycloakId,
  userRoles,
}: {
  candidacy: {
    status: CandidacyStatusStep;
    typeAccompagnement: CandidacyTypeAccompagnement;
  };
  userKeycloakId?: string | null;
  userRoles?: KeyCloakUserRole[];
}): Promise<boolean> => {
  const isMultiCandidacyActive =
    userKeycloakId !== undefined &&
    userKeycloakId !== null &&
    (await isFeatureActiveForUser({
      userKeycloakId,
      feature: "MULTI_CANDIDACY",
    }));

  // Bloquer le changement de certification si DF incomplet et MULTI_CANDIDACY actif (sauf pour l'admin)
  if (
    isMultiCandidacyActive &&
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
