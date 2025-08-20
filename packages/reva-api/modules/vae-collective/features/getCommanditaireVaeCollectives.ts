import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

export const getCommanditaireVaeCollectives = async ({
  offset = 0,
  limit = 10,
  searchFilter,
}: {
  offset?: number;
  limit?: number;
  searchFilter?: string;
}) => {
  const commanditaireVaeCollectives =
    await prismaClient.commanditaireVaeCollective.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        raisonSociale: "asc",
      },
      where: {
        raisonSociale: {
          contains: searchFilter,
          mode: "insensitive",
        },
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
