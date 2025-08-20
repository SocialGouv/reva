import { prismaClient } from "@/prisma/client";

import { archiveCandidacy } from "./archiveCandidacy";
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

    await prismaClient.candidacy.update({
      where: { id: candidacy.id },
      data: { activite: "INACTIF_CONFIRME" },
    });
    if (hasFeasibilityAdmissible) {
      const dropOutReason = await prismaClient.dropOutReason.findFirst({
        where: { label: "Inactivité depuis 6 mois" },
        select: { id: true },
      });
      if (!dropOutReason) {
        throw new Error("Drop out reason not found");
      }
      await dropOutCandidacy({
        candidacyId: candidacy.id,
        userRoles,
        dropOutReasonId: dropOutReason.id,
        dropOutConfirmedByCandidate: true,
      });
    } else {
      await archiveCandidacy({
        candidacyId: candidacy.id,
        archivingReason: "INACTIVITE_CANDIDAT",
      });
    }
  }

  return candidacy;
};
