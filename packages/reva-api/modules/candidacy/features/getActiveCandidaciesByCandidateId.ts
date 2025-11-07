import { Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export const getActiveCandidaciesByCandidateId = ({
  candidateId,
  tx,
}: {
  candidateId: string;
  tx?: Prisma.TransactionClient;
}) => {
  const prisma = tx ?? prismaClient;
  return prisma.candidacy.findMany({
    where: {
      candidateId,
      status: { not: "ARCHIVE" },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
