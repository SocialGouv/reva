import { Organism } from "@prisma/client";

import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

export const getPaginatedOrganismsByMaisonMereAAPId = async ({
  maisonMereAAPId,
  offset,
  limit,
}: {
  maisonMereAAPId: string;
  offset: number;
  limit: number;
}): Promise<PaginatedListResult<Organism>> => {
  const results = await prismaClient.organism.findMany({
    where: {
      maisonMereAAPId,
    },
    skip: offset,
    take: limit,
  });

  const count = await prismaClient.organism.count({
    where: {
      maisonMereAAPId,
    },
  });

  return {
    rows: results,
    info: processPaginationInfo({ totalRows: count, limit, offset }),
  };
};
