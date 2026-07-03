import { prismaClient } from "@/prisma/client";

import { createDFFIfNotExistsByCandidacyId } from "./createDefaultDFF";

export const getDematerializedFeasibilityFileByCandidacyId = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const dff = await prismaClient.dematerializedFeasibilityFile.findFirst({
    where: { feasibility: { candidacyId, isActive: true } },
    include: {
      dffCertificationCompetenceBlocs: true,
    },
  });

  const isDfDematAutonomeActive = await prismaClient.feature.findFirst({
    where: { key: "DF_DEMAT_AUTONOME", isActive: true },
  });

  if (isDfDematAutonomeActive && !dff) {
    await createDFFIfNotExistsByCandidacyId({ candidacyId });

    return prismaClient.dematerializedFeasibilityFile.findFirst({
      where: { feasibility: { candidacyId, isActive: true } },
      include: {
        dffCertificationCompetenceBlocs: true,
      },
    });
  }

  return dff;
};
