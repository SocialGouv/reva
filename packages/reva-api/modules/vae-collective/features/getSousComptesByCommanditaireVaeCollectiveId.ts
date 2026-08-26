import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

export const getSousComptesByCommanditaireVaeCollectiveId = async ({
  commanditaireVaeCollectiveId,
  offset = 0,
  limit = 10,
}: {
  commanditaireVaeCollectiveId: string;
  offset: number;
  limit: number;
}) => {
  //graphql n+1 query optimization (https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance)
  const sousComptes = await prismaClient.commanditaireVaeCollective
    .findUnique({
      where: { id: commanditaireVaeCollectiveId },
    })
    .sousComptesVaeCollectives({
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

  const sousComptesCount = await prismaClient.sousCompteVaeCollective.count({
    where: {
      commanditaireVaeCollectiveId,
    },
  });

  return {
    rows: sousComptes,
    info: processPaginationInfo({
      limit,
      offset,
      totalRows: sousComptesCount,
    }),
  };
};
