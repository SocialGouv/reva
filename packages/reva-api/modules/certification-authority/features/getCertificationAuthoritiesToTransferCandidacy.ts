import { Prisma } from "@prisma/client";

import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

export const getCertificationAuthoritiesToTransferCandidacy = async ({
  candidacyId,
  offset = 0,
  limit = 10,
  searchFilter,
}: {
  candidacyId: string;
  offset?: number;
  limit?: number;
  searchFilter?: string;
}) => {
  const candidacy = await prismaClient.candidacy.findUnique({
    where: {
      id: candidacyId,
    },
    include: {
      Feasibility: true,
    },
  });

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  if (!candidacy.certificationId) {
    throw new Error("La candidature n'est pas associée à une certification");
  }

  const candidacyActiveFeasibility = candidacy.Feasibility.find(
    (feasibility) => feasibility.isActive,
  );

  if (!candidacyActiveFeasibility) {
    throw new Error(
      "La candidature n'a pas de dossier de faisabilité en cours",
    );
  }

  if (!candidacyActiveFeasibility.certificationAuthorityId) {
    throw new Error(
      "Le dossier de faisabilité n'est pas relié à une autorité de certification",
    );
  }

  const whereClause: Prisma.CertificationAuthorityWhereInput = {
    label: {
      contains: searchFilter,
      mode: "insensitive",
    },
    id: {
      not: candidacyActiveFeasibility.certificationAuthorityId,
    },
    certificationAuthorityOnCertification: {
      some: {
        certificationId: candidacy.certificationId,
      },
    },
  };

  const certificationAuthoritiesCount =
    await prismaClient.certificationAuthority.count({
      where: whereClause,
    });

  const certificationAuthorities =
    await prismaClient.certificationAuthority.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
    });

  return {
    rows: certificationAuthorities,
    info: processPaginationInfo({
      totalRows: certificationAuthoritiesCount,
      limit,
      offset,
    }),
  };
};
