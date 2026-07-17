import { DOSSIER_FAISABILITE_DEMATERIALISE_NON_TROUVE } from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

import { getDematerializedFeasibilityFileByCandidacyId } from "./getDematerializedFeasibilityFileByCandidacyId";

export const createOrUpdateComplementExperienceParcoursVise = async ({
  candidacyId,
  complementExperienceParcoursVise,
}: {
  candidacyId: string;
  complementExperienceParcoursVise: string;
}) => {
  const dFF = await getDematerializedFeasibilityFileByCandidacyId({
    candidacyId,
  });

  if (!dFF) {
    throw new Error(DOSSIER_FAISABILITE_DEMATERIALISE_NON_TROUVE);
  }

  return prismaClient.dematerializedFeasibilityFile.update({
    where: { id: dFF.id },
    data: {
      complementExperienceParcoursVise,
    },
  });
};
