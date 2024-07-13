import { prismaClient } from "../../../prisma/client";
import { processPaginationInfo } from "../../shared/list/pagination";

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
      certificationsAndRegions: true,
      Feasibility: true,
    },
  });

  if (!candidacy) {
    throw new Error("Candidacy not found");
  }

  const candidacyActiveCertification = candidacy.certificationsAndRegions.find(
    (certification) => certification.isActive,
  );

  if (!candidacyActiveCertification) {
    throw new Error("Candidacy has no active certification");
  }

  const candidacyActiveFeasibility = candidacy.Feasibility.find(
    (feasibility) => feasibility.isActive,
  );

  const whereClause = {
    label: {
      contains: searchFilter,
      mode: "insensitive" as any,
    },
    id: {
      not: candidacyActiveFeasibility?.certificationAuthorityId || "",
    },
    certificationAuthorityOnCertification: {
      some: {
        certificationId: candidacyActiveCertification.certificationId,
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
