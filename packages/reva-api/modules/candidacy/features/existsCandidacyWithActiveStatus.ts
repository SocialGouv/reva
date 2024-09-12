import { CandidacyStatusStep, Prisma } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const existsCandidacyWithActiveStatus = async ({
  candidacyId,
  status,
  tx,
}: {
  candidacyId: string;
  status?: CandidacyStatusStep;
  tx?: Prisma.TransactionClient; //optional transaction to use
}): Promise<boolean | string> => {
  const candidacies = await (tx || prismaClient).candidacy.count({
    where: {
      id: candidacyId,
      candidacyStatuses: {
        some: {
          status,
          isActive: true,
        },
      },
    },
  });

  return candidacies === 1;
};
