import { Prisma } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { processPaginationInfo } from "../../shared/list/pagination";
import { CertificationAuthority } from "../certification-authority.types";

export const getCertificationAuthorities = async ({
  limit = 10,
  offset = 0,
  searchFilter,
}: {
  limit?: number;
  offset?: number;
  searchFilter?: string;
}): Promise<PaginatedListResult<CertificationAuthority>> => {
  let whereClause: Prisma.CertificationAuthorityWhereInput = {};

  if (searchFilter) {
    whereClause = { label: { contains: searchFilter, mode: "insensitive" } };
  }

  const certificationAuthorities =
    await prismaClient.certificationAuthority.findMany({
      where: whereClause,
      orderBy: [{ label: "asc" }],
      take: limit,
      skip: offset,
    });
  const count = await prismaClient.certificationAuthority.count({
    where: whereClause,
  });

  return {
    rows: certificationAuthorities,
    info: processPaginationInfo({
      totalRows: count,
      limit: limit,
      offset,
    }),
  };
};
