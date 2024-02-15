import { deburr } from "lodash";

import { prismaClient } from "../../../prisma/client";
import { processPaginationInfo } from "../../shared/list/pagination";
import { Certification, CertificationStatus } from "../referential.types";
import { $Enums, Prisma } from "@prisma/client";

export const searchCertificationsForAdmin = async ({
  offset,
  limit,
  searchText,
  status,
}: {
  offset?: number;
  limit?: number;
  searchText?: string;
  status?: CertificationStatus;
}): Promise<PaginatedListResult<Certification>> => {
  const realLimit = limit || 10;
  const realOffset = offset || 0;

  let whereClause: Prisma.CertificationWhereInput = {};

  if (searchText) {
    whereClause = {
      ...whereClause,
      OR: [
        { label: { contains: searchText, mode: "insensitive" } },
        { rncpId: { contains: searchText, mode: "insensitive" } },
        {
          certificationAuthorityTag: {
            contains: searchText,
            mode: "insensitive",
          },
        },
        {
          typeDiplome: { label: { contains: searchText, mode: "insensitive" } },
        },
      ],
    };
  }

  if (status) {
    whereClause = {
      ...whereClause,
      status: status as $Enums.CertificationStatus,
    };
  }

  const certifications = await prismaClient.certification.findMany({
    where: whereClause,
    orderBy: [{ label: "asc" }],
    take: limit,
    skip: offset,
  });

  const count = await prismaClient.certification.count({
    where: whereClause,
  });

  return {
    rows: certifications.map((c) => ({ ...c, codeRncp: c.rncpId })),
    info: processPaginationInfo({
      totalRows: count,
      limit: realLimit,
      offset: realOffset,
    }),
  };
};
