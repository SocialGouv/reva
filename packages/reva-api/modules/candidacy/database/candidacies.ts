import { CandidacyStatusStep } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const getCandidaciesFromIds = async (candidacyIds: string[]) =>
  prismaClient.candidacy.findMany({
    where: {
      id: { in: candidacyIds },
    },
  });

export const updateCandidacyStatus = async (params: {
  candidacyId: string;
  status: CandidacyStatusStep;
}) => {
  const [, newCandidacy] = await prismaClient.$transaction([
    prismaClient.candidaciesStatus.updateMany({
      where: {
        candidacyId: params.candidacyId,
      },
      data: {
        isActive: false,
      },
    }),
    prismaClient.candidacy.update({
      where: {
        id: params.candidacyId,
      },
      data: {
        candidacyStatuses: {
          create: {
            status: params.status,
            isActive: true,
          },
        },
      },
    }),
  ]);

  return newCandidacy;
};

export const updateOrganism = async (params: {
  candidacyId: string;
  organismId: string | null;
}) =>
  prismaClient.candidacy.update({
    where: {
      id: params.candidacyId,
    },
    data: {
      organismId: params.organismId,
    },
  });
