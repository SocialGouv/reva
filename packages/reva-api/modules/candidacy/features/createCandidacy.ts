import {
  CandidacyStatusStep,
  CandidacyTypeAccompagnement,
} from "@prisma/client";
import { prismaClient } from "../../../prisma/client";

export const createCandidacy = async ({
  candidateId,
  typeAccompagnement,
}: {
  candidateId: string;
  typeAccompagnement: CandidacyTypeAccompagnement;
}) => {
  return prismaClient.candidacy.create({
    data: {
      typeAccompagnement,
      candidateId,
      admissibility: { create: {} },
      examInfo: { create: {} },
      status: "PROJET",
      financeModule: "hors_plateforme",
      candidacyStatuses: {
        create: {
          status: CandidacyStatusStep.PROJET,
          isActive: true,
        },
      },
    },
  });
};
