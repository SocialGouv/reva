import { prismaClient } from "../../../prisma/client";

export const getAccountByOrganismId = ({
  organismId,
}: {
  organismId: string;
}) =>
  prismaClient.account.findFirst({
    where: { organismId },
  });
