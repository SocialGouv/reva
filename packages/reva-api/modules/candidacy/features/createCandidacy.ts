import {
  CandidacyStatusStep,
  CandidacyTypeAccompagnement,
} from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const createCandidacy = async ({
  candidateId,
  typeAccompagnement,
  cohorteVaeCollectiveId,
}: {
  candidateId: string;
  typeAccompagnement: CandidacyTypeAccompagnement;
  cohorteVaeCollectiveId?: string;
}) => {
  return prismaClient.candidacy.create({
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
