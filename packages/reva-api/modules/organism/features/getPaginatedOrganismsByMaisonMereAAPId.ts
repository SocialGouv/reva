import { Organism, Prisma } from "@prisma/client";

import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

export const getPaginatedOrganismsByMaisonMereAAPId = async ({
  maisonMereAAPId,
  collaborateurAccountIdFilter,
  offset,
  limit,
}: {
  maisonMereAAPId: string;
  collaborateurAccountIdFilter?: string;
  offset: number;
  limit: number;
}): Promise<PaginatedListResult<Organism>> => {
  const where: Prisma.OrganismWhereInput = {
    maisonMereAAPId,
  };

  if (collaborateurAccountIdFilter) {
    where.organismOnAccounts = {
      some: { accountId: collaborateurAccountIdFilter },
    };
  }

  const results = await prismaClient.organism.findMany({
    where,
    skip: offset,
    take: limit,
  });

  const count = await prismaClient.organism.count({
    where,
  });

  return {
    rows: results,
    info: processPaginationInfo({ totalRows: count, limit, offset }),
  };
};
