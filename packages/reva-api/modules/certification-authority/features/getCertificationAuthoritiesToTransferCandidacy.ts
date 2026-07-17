import { Prisma } from "@prisma/client";

import {
  CANDIDATURE_NON_TROUVEE,
  CANDIDATURE_PAS_ASSOCIEE_CERTIFICATION,
  CANDIDATURE_PAS_DOSSIER_FAISABILITE_COURS,
  DOSSIER_FAISABILITE_PAS_RELIE_AUTORITE_CERTIFICATION,
} from "@/modules/shared/errors/messages";
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
    throw new Error(CANDIDATURE_NON_TROUVEE);
  }

  if (!candidacy.certificationId) {
    throw new Error(CANDIDATURE_PAS_ASSOCIEE_CERTIFICATION);
  }

  const candidacyActiveFeasibility = candidacy.Feasibility.find(
    (feasibility) => feasibility.isActive,
  );

  if (!candidacyActiveFeasibility) {
    throw new Error(CANDIDATURE_PAS_DOSSIER_FAISABILITE_COURS);
  }

  if (!candidacyActiveFeasibility.certificationAuthorityId) {
    throw new Error(DOSSIER_FAISABILITE_PAS_RELIE_AUTORITE_CERTIFICATION);
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
