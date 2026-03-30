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
    throw new Error("Dossier de faisabilité dématérialisé non trouvé");
  }

  return prismaClient.dematerializedFeasibilityFile.update({
    where: { id: dFF.id },
    data: {
      complementExperienceParcoursVise,
    },
  });
};
