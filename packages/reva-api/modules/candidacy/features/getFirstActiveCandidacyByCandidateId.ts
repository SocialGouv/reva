import { Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export const getFirstActiveCandidacyByCandidateId = ({
  candidateId,
  tx,
}: {
  candidateId: string;
  tx?: Prisma.TransactionClient;
}) => {
  const prisma = tx ?? prismaClient;
  return prisma.candidacy.findFirst({
    where: {
      candidateId,
      status: { not: "ARCHIVE" },
    },
  });
};
