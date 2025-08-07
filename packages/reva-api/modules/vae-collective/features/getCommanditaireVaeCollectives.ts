import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

export const getCommanditaireVaeCollectives = async ({
  offset = 0,
  limit = 10,
}: {
  offset?: number;
  limit?: number;
}) => {
  //graphql n+1 query optimization (https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance)
  const commanditaireVaeCollectives =
    await prismaClient.commanditaireVaeCollective.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: "desc",
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
