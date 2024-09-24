import {
  CandidacyStatusStep,
  CandidacyTypeAccompagnement,
} from "@prisma/client";
import { prismaClient } from "../../../prisma/client";

export const createCandidacy = ({
  candidateId,
  departmentId,
  typeAccompagnement,
}: {
  candidateId: string;
  departmentId: string;
  typeAccompagnement: CandidacyTypeAccompagnement;
}) =>
  prismaClient.candidacy.create({
    data: {
      typeAccompagnement,
      departmentId,
      candidateId,
      admissibility: { create: {} },
      examInfo: { create: {} },
      status: "PROJET",
      candidacyStatuses: {
        create: {
          status: CandidacyStatusStep.PROJET,
          isActive: true,
        },
      },
    },
  });
