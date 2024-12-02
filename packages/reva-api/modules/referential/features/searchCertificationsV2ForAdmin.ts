import { $Enums, Prisma } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { processPaginationInfo } from "../../shared/list/pagination";
import { Certification, CertificationStatusV2 } from "../referential.types";

export const searchCertificationsV2ForAdmin = async ({
  offset,
  limit,
  searchText,
  status,
  visible,
}: {
  offset?: number;
  limit?: number;
  searchText?: string;
  status?: CertificationStatusV2;
  visible?: boolean;
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
          certificationAuthorityStructure: {
            label: {
              contains: searchText,
              mode: "insensitive",
            },
          },
        },
        {
          rncpTypeDiplome: { contains: searchText, mode: "insensitive" },
        },
      ],
    };
  }

  if (status) {
    whereClause = {
      ...whereClause,
      statusV2: status as $Enums.CertificationStatusV2,
    };
  }

  if (visible) {
    whereClause = {
      ...whereClause,
      visible,
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
