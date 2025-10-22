import { prismaClient } from "@/prisma/client";

export const getAccountsByOrganismId = async ({
  organismId,
}: {
  organismId: string;
}) =>
  prismaClient.account.findMany({
    where: { organismOnAccounts: { some: { organismId } } },
  });
