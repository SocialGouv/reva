import { Prisma } from "@prisma/client";

import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

export const getParcoursCertificationByCertificationId = async ({
  certificationId,
  offset,
  limit,
  searchFilter,
  certificationAuthorityIdFilter,
}: {
  certificationId: string;
  offset?: number;
  limit?: number;
  searchFilter?: string;
  certificationAuthorityIdFilter?: string;
}) => {
  const whereClause: Prisma.ParcoursCertificationWhereInput = {
    certificationId,
  };

  if (searchFilter) {
    whereClause.OR = [
      { label: { contains: searchFilter, mode: "insensitive" } },
      { nomEtablissement: { contains: searchFilter, mode: "insensitive" } },
    ];
  }

  if (certificationAuthorityIdFilter) {
    whereClause.certificationAuthorityOnCertificationOnParcoursCertifications =
      {
        some: {
          certificationAuthorityOnCertification: {
            certificationAuthorityId: certificationAuthorityIdFilter,
          },
        },
      };
  }
  const parcours = await prismaClient.parcoursCertification.findMany({
    where: whereClause,
    skip: offset,
    take: limit,
    orderBy: { label: "asc" },
  });

  const count = await prismaClient.parcoursCertification.count({
    where: whereClause,
  });

  return {
    rows: parcours,
    info: processPaginationInfo({
      totalRows: count,
      limit: limit ?? 10,
      offset: offset ?? 0,
    }),
  };
};
