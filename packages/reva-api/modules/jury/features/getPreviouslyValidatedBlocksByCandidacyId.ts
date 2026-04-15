import { CertificationCompetenceBloc } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export const getPreviouslyValidatedBlocksByCandidacyId = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const deduplicatedBlocks = new Map<string, CertificationCompetenceBloc>();
  return prismaClient.juryResultByCompetenceBloc
    .findMany({
      where: {
        jury: { candidacyId, isActive: false },
        isCompetenceBlocValidated: true,
      },
      include: {
        competenceBloc: true,
      },
    })
    .then((blocks) => {
      blocks.forEach((block) => {
        deduplicatedBlocks.set(block.competenceBloc.id, block.competenceBloc);
      });
      return Array.from(deduplicatedBlocks.values());
    });
};
