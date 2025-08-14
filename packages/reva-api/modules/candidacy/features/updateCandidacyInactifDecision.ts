import { prismaClient } from "@/prisma/client";
import { deleteCandidacy } from "./deleteCandidacy";
import { dropOutCandidacy } from "./dropOutCandidacy";

export const updateCandidacyInactifDecision = async ({
  continueCandidacy,
  candidacyId,
  userRoles,
}: {
  continueCandidacy: boolean;
  candidacyId: string;
  userRoles: KeyCloakUserRole[];
}) => {
  const candidacy = await prismaClient.candidacy.findFirst({
    where: { id: candidacyId },
    include: {
      candidate: true,
      Feasibility: true,
    },
  });

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  if (continueCandidacy) {
    await prismaClient.candidacy.update({
      where: { id: candidacy.id },
      data: { activite: "ACTIF", derniereDateActivite: new Date() },
    });
  } else {
    const activeFeasibility = candidacy.Feasibility.find(
      (feasibility) => feasibility.isActive,
    );
    const hasFeasibilityAdmissible =
      activeFeasibility?.decision === "ADMISSIBLE";

    if (hasFeasibilityAdmissible) {
      await dropOutCandidacy({
        candidacyId: candidacy.id,
        userRoles,
        dropOutReasonId: "INACTIVITE_CANDIDAT",
      });
      await prismaClient.candidacy.update({
        where: { id: candidacy.id },
        data: { activite: "INACTIF_CONFIRME" },
      });
    } else {
      await deleteCandidacy({ candidacyId: candidacy.id });
    }
  }

  return candidacy;
};
