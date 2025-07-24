import { $Enums, Prisma } from "@prisma/client";

import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

import { Certification, CertificationStatus } from "../referential.types";

export const searchCertificationsV2ForRegistryManager = async ({
  userKeycloakId,
  offset,
  limit,
  searchText,
  status,
  visible,
}: {
  userKeycloakId: string;
  offset?: number;
  limit?: number;
  searchText?: string;
  status?: CertificationStatus;
  visible?: boolean;
}): Promise<PaginatedListResult<Certification>> => {
  const realLimit = limit || 10;
  const realOffset = offset || 0;

  const localAccount = await prismaClient.account.findFirst({
    where: {
      keycloakId: userKeycloakId,
    },
  });

  if (!localAccount) {
    throw new Error(
      "Le compte du responsable de référentiel n'a pas pu être trouvé.",
    );
  }

  const registryManager =
    await prismaClient.certificationRegistryManager.findFirst({
      where: {
        accountId: localAccount?.id,
      },
    });

  if (!registryManager) {
    throw new Error(
      "Aucun responsable de référentiel n'existe avec cet identifiant",
    );
  }

  let whereClause: Prisma.CertificationWhereInput = {
    certificationAuthorityStructureId:
      registryManager?.certificationAuthorityStructureId,
  };

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
