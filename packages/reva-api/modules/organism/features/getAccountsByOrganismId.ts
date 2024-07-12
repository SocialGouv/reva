import { prismaClient } from "../../../prisma/client";

export const getAccountsByOrganismId = async ({
  organismId,
}: {
  organismId: string;
}) =>
  prismaClient.organism
    .findUnique({
      where: { id: organismId },
    })
    .accounts();
