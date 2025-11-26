import { Organism, Prisma } from "@prisma/client";

import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

export const getPaginatedOrganismsByMaisonMereAAPId = async ({
  maisonMereAAPId,
  searchFilter,
  collaborateurAccountIdFilter,
  offset,
  limit,
}: {
  maisonMereAAPId: string;
  searchFilter?: string;
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

  if (searchFilter) {
    where.OR = [
      { label: { contains: searchFilter, mode: "insensitive" } },
      { adresseCodePostal: { contains: searchFilter, mode: "insensitive" } },
      { adresseVille: { contains: searchFilter, mode: "insensitive" } },
    ];
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
