import {
  CandidacyStatusStep,
  CandidacyTypeAccompagnement,
  Prisma,
} from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export const createCandidacy = async ({
  candidateId,
  typeAccompagnement,
  cohorteVaeCollectiveId,
  tx,
}: {
  candidateId: string;
  typeAccompagnement: CandidacyTypeAccompagnement;
  cohorteVaeCollectiveId?: string;
  tx?: Prisma.TransactionClient;
}) => {
  const prisma = tx ?? prismaClient;
  return prisma.candidacy.create({
    data: {
      typeAccompagnement,
      candidateId,
      admissibility: { create: {} },
      examInfo: { create: {} },
      status: "PROJET",
      financeModule: "hors_plateforme",
      cohorteVaeCollectiveId,
      candidacyStatuses: {
        create: {
          status: CandidacyStatusStep.PROJET,
        },
      },
    },
  });
};
