import { CandidacyStatusStep } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import * as domain from "../candidacy.types";

export const updateCandidacyStatus = async (params: {
  candidacyId: string;
  status: CandidacyStatusStep;
}): Promise<domain.Candidacy> => {
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
