import { Account, Prisma } from "@prisma/client";

import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

export const getPaginatedComptesCollaborateursByMaisonMereAAPId = async ({
  maisonMereAAPId,
  searchFilter,
  offset,
  limit,
}: {
  maisonMereAAPId: string;
  searchFilter?: string;
  offset: number;
  limit: number;
}): Promise<PaginatedListResult<Account>> => {
  const where: Prisma.MaisonMereAAPOnAccountWhereInput = {
    maisonMereAAPId,
  };

  console.log("searchFilter", searchFilter);

  if (searchFilter) {
    where.account = {
      OR: [
        { firstname: { contains: searchFilter, mode: "insensitive" } },
        { lastname: { contains: searchFilter, mode: "insensitive" } },
        { email: { contains: searchFilter, mode: "insensitive" } },
      ],
    };
  }

  const links = await prismaClient.maisonMereAAPOnAccount.findMany({
    where,
    include: { account: true },
    skip: offset,
    take: limit,
    orderBy: [
      { account: { lastname: "asc" } },
      { account: { firstname: "asc" } },
    ],
  });

  const count = await prismaClient.maisonMereAAPOnAccount.count({ where });

  return {
    rows: links.map((link) => link.account),
    info: processPaginationInfo({ totalRows: count, limit, offset }),
  };
};
