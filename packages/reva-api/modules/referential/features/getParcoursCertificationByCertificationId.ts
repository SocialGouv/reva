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
  const parcoursCertificationWhereClause: Prisma.ParcoursCertificationWhereInput =
    {};

  if (searchFilter) {
    parcoursCertificationWhereClause.OR = [
      { label: { contains: searchFilter, mode: "insensitive" } },
      { nomEtablissement: { contains: searchFilter, mode: "insensitive" } },
    ];
  }

  if (certificationAuthorityIdFilter) {
    parcoursCertificationWhereClause.certificationAuthorityOnCertificationOnParcoursCertifications =
      {
        some: {
          certificationAuthorityOnCertification: {
            certificationAuthorityId: certificationAuthorityIdFilter,
          },
        },
      };
  }
  const parcours = await prismaClient.certification
    .findUnique({
      where: { id: certificationId },
    })
    .parcours({
      where: parcoursCertificationWhereClause,
      skip: offset,
      take: limit,
      orderBy: { label: "asc" },
    });

  const count = await prismaClient.parcoursCertification.count({
    where: { certificationId, ...parcoursCertificationWhereClause },
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
