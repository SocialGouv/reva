import { prismaClient } from "@/prisma/client";

export const getOrganismsByAccountId = async ({
  accountId,
}: {
  accountId: string;
}) =>
  prismaClient.organism.findMany({
    where: { organismOnAccounts: { some: { accountId } } },
  });
