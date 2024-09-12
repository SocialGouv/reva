import { CandidacyStatusStep, Prisma } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const updateCandidacyStatus = async ({
  candidacyId,
  status,
  tx,
}: {
  candidacyId: string;
  status: CandidacyStatusStep;
  tx?: Prisma.TransactionClient; //optional transaction to use
}) => {
  const withTransaction = async (t: Prisma.TransactionClient) => {
    await t.candidaciesStatus.updateMany({
      where: {
        candidacyId,
      },
      data: {
        isActive: false,
      },
    });
    return t.candidacy.update({
      where: {
        id: candidacyId,
      },
      data: {
        candidacyStatuses: {
          create: {
            status,
            isActive: true,
          },
        },
      },
    });
  };

  //execute the code in the transaction provided or create a new one
  return tx ? withTransaction(tx) : prismaClient.$transaction(withTransaction);
};
