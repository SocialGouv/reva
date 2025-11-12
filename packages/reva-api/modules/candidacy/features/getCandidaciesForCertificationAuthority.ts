import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

import { GetCandidaciesForCertificationAuthorityInput } from "../candidacy.types";

export const getCandidaciesForCertificationAuthority = async ({
  certificationAuthorityId,
  hasRole,
  offset = 0,
  limit = 10000,
}: GetCandidaciesForCertificationAuthorityInput & {
  hasRole(role: string): boolean;
}) => {
  if (hasRole("manage_feasibility") && !certificationAuthorityId) {
    throw new Error(
      "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource",
    );
  }

  const totalRows = await prismaClient.candidacy.count({
    where: {
      Feasibility: {
        some: {
          certificationAuthorityId: certificationAuthorityId,
        },
      },
    },
  });

  const candidacies = await prismaClient.candidacy.findMany({
    where: {
      Feasibility: {
        some: {
          certificationAuthorityId: certificationAuthorityId,
        },
      },
    },
    skip: offset,
    take: limit,
  });

  return {
    rows: candidacies,
    info: processPaginationInfo({
      totalRows,
      limit,
      offset,
    }),
  };
};
