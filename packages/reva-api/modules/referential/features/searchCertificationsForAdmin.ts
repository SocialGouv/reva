import { $Enums, Prisma } from "@prisma/client";

import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

import { Certification, CertificationStatus } from "../referential.types";

export const searchCertificationsForAdmin = async ({
  offset,
  limit,
  searchText,
  status,
  visible,
  certificationAuthorityIdFilter,
  certificationAuthorityStructureIdFilter,
}: {
  offset?: number;
  limit?: number;
  searchText?: string;
  status?: CertificationStatus;
  visible?: boolean;
  certificationAuthorityIdFilter?: string; // If provided, only certifications managed by the collaborateur authority will be returned
  certificationAuthorityStructureIdFilter?: string; // If provided, only certifications managed by the certification authority structure will be returned
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
      status: status as $Enums.CertificationStatus,
    };
  }

  if (typeof visible == "boolean") {
    whereClause = {
      ...whereClause,
      visible,
    };
  }

  if (certificationAuthorityIdFilter) {
    whereClause = {
      ...whereClause,
      certificationAuthorityOnCertification: {
        some: {
          certificationAuthorityId: certificationAuthorityIdFilter,
        },
      },
    };
  }

  if (certificationAuthorityStructureIdFilter) {
    whereClause = {
      ...whereClause,
      certificationAuthorityStructureId:
        certificationAuthorityStructureIdFilter,
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
