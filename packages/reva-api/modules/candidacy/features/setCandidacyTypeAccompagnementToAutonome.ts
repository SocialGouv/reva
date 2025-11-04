import { Candidacy } from "@prisma/client";

import { getActiveFeasibilityByCandidacyid } from "@/modules/feasibility/feasibility.features";
import { prismaClient } from "@/prisma/client";

import { getCandidacyById } from "./getCandidacyById";

export const setCandidacyTypeAccompagnementToAutonome = async ({
  candidacyId,
}: {
  candidacyId: string;
}): Promise<Candidacy> => {
  const candidacy = await getCandidacyById({ candidacyId });

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  if (candidacy.typeAccompagnement === "AUTONOME") {
    throw new Error(
      "Impossible de modifier le type d'accompagnement. Le type d'accompagnement est déjà AUTONOME",
    );
  }
  if (candidacy.financeModule !== "hors_plateforme") {
    throw new Error(
      "Impossible de modifier le type d'accompagnement si l'utilisateur n'est pas hors financement",
    );
  }
  if (candidacy.feasibilityFormat === "DEMATERIALIZED") {
    const activeFeasibility = await getActiveFeasibilityByCandidacyid({
      candidacyId,
    });

    if (activeFeasibility && activeFeasibility.decision !== "ADMISSIBLE") {
      throw new Error(
        "Impossible de modifier le type d'accompagnement d'un DF dématérialisé si la recevabilité n'est pas valide",
      );
    } else if (
      activeFeasibility &&
      activeFeasibility.decision === "ADMISSIBLE"
    ) {
      // On ne modifie pas le format d'un DF déjà admis
      return prismaClient.candidacy.update({
        where: { id: candidacyId },
        data: {
          typeAccompagnement: "AUTONOME",
          organism: { disconnect: true },
        },
      });
    }
  }

  // Si pas de DF envoyé, on passe au DF papier
  return prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: {
      typeAccompagnement: "AUTONOME",
      feasibilityFormat: "UPLOADED_PDF",
      organism: { disconnect: true },
    },
  });
};
