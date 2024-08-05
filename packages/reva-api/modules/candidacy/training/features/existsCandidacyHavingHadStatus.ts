import { CandidacyStatusStep } from "@prisma/client";
import { prismaClient } from "../../../../prisma/client";

export const existsCandidacyHavingHadStatus = async (params: {
  candidacyId: string;
  status: CandidacyStatusStep;
}) =>
  !!(await prismaClient.candidacy.count({
    where: {
      id: params.candidacyId,
      candidacyStatuses: {
        some: {
          status: params.status,
        },
      },
    },
  }));
