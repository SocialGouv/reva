import { Candidacy, CandidacyStatusStep, Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export const updateCandidacyStatus = async ({
  candidacyId,
  status,
  tx,
}: {
  candidacyId: string;
  status: CandidacyStatusStep;
  tx?: Prisma.TransactionClient; //optional transaction to use
}): Promise<Candidacy> => {
  const prisma = tx ?? prismaClient;
  return prisma.candidacy.update({
    where: {
      id: candidacyId,
    },
    data: {
      ...(() => (status == "VALIDATION" ? { sentAt: new Date() } : {}))(),
      status,
      candidacyStatuses: {
        create: {
          status,
        },
      },
    },
  });
};
