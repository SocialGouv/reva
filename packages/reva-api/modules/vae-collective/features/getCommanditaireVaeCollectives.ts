import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

export const getCommanditaireVaeCollectives = async ({
  offset = 0,
  limit = 10,
}: {
  offset?: number;
  limit?: number;
}) => {
  const commanditaireVaeCollectives =
    await prismaClient.commanditaireVaeCollective.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        raisonSociale: "asc",
      },
    });

  const commanditaireVaeCollectivesCount =
    await prismaClient.commanditaireVaeCollective.count();

  return {
    rows: commanditaireVaeCollectives,
    info: processPaginationInfo({
      limit,
      offset,
      totalRows: commanditaireVaeCollectivesCount,
    }),
  };
};
