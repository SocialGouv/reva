import {
  CandidacyStatusStep,
  CandidacyTypeAccompagnement,
} from "@prisma/client";
import { prismaClient } from "../../../prisma/client";

export const createCandidacy = async ({
  candidateId,
  departmentId,
  typeAccompagnement,
}: {
  candidateId: string;
  departmentId: string;
  typeAccompagnement: CandidacyTypeAccompagnement;
}) => {
  return prismaClient.candidacy.create({
    data: {
      typeAccompagnement,
      departmentId,
      candidateId,
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
