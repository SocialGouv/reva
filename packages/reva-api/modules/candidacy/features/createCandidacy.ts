import { CandidacyStatusStep } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";

export const createCandidacy = ({
  candidateId,
  departmentId,
}: {
  candidateId: string;
  departmentId: string;
}) =>
  prismaClient.candidacy.create({
    data: {
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
