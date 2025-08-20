import { Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export const getCandidateByKeycloakId = ({
  keycloakId,
  tx,
}: {
  keycloakId: string;
  tx?: Prisma.TransactionClient;
}) => {
  const prisma = tx ?? prismaClient;
  return prisma.candidate.findUnique({ where: { keycloakId } });
};
