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
}): Promise<boolean> =>
  !!(await (tx || prismaClient).candidacy.findUnique({
    where: {
      id: candidacyId,
      status,
    },
  }));
