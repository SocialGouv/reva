import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

export const getCohortesVaeCollectivesByCommanditaireVaeCollectiveId = async ({
  commanditaireVaeCollectiveId,
  offset = 0,
  limit = 10,
}: {
  commanditaireVaeCollectiveId: string;
  offset: number;
  limit: number;
}) => {
  //graphql n+1 query optimization (https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance)
  const cohorteVaeCollectives = await prismaClient.commanditaireVaeCollective
    .findUnique({
      where: { id: commanditaireVaeCollectiveId },
    })
    .cohorteVaeCollectives({
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

  const cohorteVaeCollectivesCount =
    await prismaClient.cohorteVaeCollective.count({
      where: {
        commanditaireVaeCollectiveId,
      },
    });

  return {
    rows: cohorteVaeCollectives,
    info: processPaginationInfo({
      limit,
      offset,
      totalRows: cohorteVaeCollectivesCount,
    }),
  };
};
