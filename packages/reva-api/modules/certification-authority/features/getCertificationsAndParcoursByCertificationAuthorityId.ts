import { Certification, ParcoursCertification, Prisma } from "@prisma/client";

import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

export const getCertificationsAndParcoursByCertificationAuthorityId = async ({
  certificationAuthorityId,
  offset,
  limit,
  searchText,
  certificationAuthorityLocalAccountIdFilter,
}: {
  certificationAuthorityId: string;
  offset?: number;
  limit?: number;
  searchText?: string;
  certificationAuthorityLocalAccountIdFilter?: string;
}): Promise<
  PaginatedListResult<{
    certification: Certification;
    parcours: ParcoursCertification[];
  }>
> => {
  const certificationAuthorityOnCertificationWhereClause: Prisma.CertificationAuthorityOnCertificationWhereInput =
    {};
  certificationAuthorityOnCertificationWhereClause.certification = {};
  if (searchText) {
    certificationAuthorityOnCertificationWhereClause.certification = {
      OR: [
        { label: { contains: searchText, mode: "insensitive" } },
        { rncpId: { contains: searchText, mode: "insensitive" } },
        {
          certificationAuthorityStructure: {
            label: { contains: searchText, mode: "insensitive" },
          },
        },
        {
          rncpTypeDiplome: { contains: searchText, mode: "insensitive" },
        },
      ],
    };
  }

  if (certificationAuthorityLocalAccountIdFilter) {
    certificationAuthorityOnCertificationWhereClause.certification.certificationAuthorityLocalAccountOnCertification =
      {
        some: {
          certificationAuthorityLocalAccountId:
            certificationAuthorityLocalAccountIdFilter,
        },
      };
  }

  const certificationsAndParcours = await prismaClient.certificationAuthority
    .findUnique({
      where: {
        id: certificationAuthorityId,
      },
      include: {
        certificationAuthorityOnCertification: {
          where: certificationAuthorityOnCertificationWhereClause,
          include: {
            certification: true,
            certificationAuthorityOnCertificationOnParcoursCertifications: {
              include: { parcoursCertification: true },
            },
          },
          skip: offset ?? 0,
          take: limit ?? 10,
          orderBy: {
            certification: {
              label: "asc",
            },
          },
        },
      },
    })
    .then((certificationAuthority) => {
      return (
        certificationAuthority?.certificationAuthorityOnCertification || []
      ).map((cac) => ({
        certification: cac.certification,
        parcours:
          cac.certificationAuthorityOnCertificationOnParcoursCertifications.map(
            (cacopc) => cacopc.parcoursCertification,
          ),
      }));
    });

  const count = await prismaClient.certificationAuthorityOnCertification.count({
    where: {
      certificationAuthority: { id: certificationAuthorityId },
      ...certificationAuthorityOnCertificationWhereClause,
    },
  });

  return {
    rows: certificationsAndParcours,
    info: processPaginationInfo({
      totalRows: count,
      limit: limit ?? 10,
      offset: offset ?? 0,
    }),
  };
};
