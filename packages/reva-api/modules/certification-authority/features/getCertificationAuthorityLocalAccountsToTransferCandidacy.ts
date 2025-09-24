import { Prisma } from "@prisma/client";

import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

export const getCertificationAuthorityLocalAccountsToTransferCandidacy =
  async ({
    candidacyId,
    offset = 0,
    limit = 10,
    searchFilter,
    keycloakId,
  }: {
    candidacyId: string;
    offset?: number;
    limit?: number;
    searchFilter?: string;
    keycloakId?: string;
  }) => {
    const candidacy = await prismaClient.candidacy.findUnique({
      where: {
        id: candidacyId,
      },
      include: {
        candidate: true,
        Feasibility: {
          where: { isActive: true },
        },
      },
    });

    if (!candidacy) {
      throw new Error("Candidature non trouvée");
    }

    if (!candidacy.candidate?.departmentId) {
      throw new Error(
        "Le candidat associé à la candidature n'est pas rattaché à un département",
      );
    }

    if (!candidacy.certificationId) {
      throw new Error("La candidature n'est pas associée à une certification");
    }

    const feasibility = candidacy.Feasibility[0];

    if (!feasibility) {
      throw new Error(
        "La candidature n'a pas de dossier de faisabilité en cours",
      );
    }

    if (!feasibility.certificationAuthorityId) {
      throw new Error(
        "Le dossier de faisabilité n'est pas relié à une autorité de certification",
      );
    }

    let certificationAuthorityIds = [feasibility.certificationAuthorityId];

    const certificationAuthorityStructureRelation =
      await prismaClient.certificationAuthorityOnCertificationAuthorityStructure.findFirst(
        {
          where: {
            certificationAuthorityId: feasibility.certificationAuthorityId,
          },
        },
      );

    if (certificationAuthorityStructureRelation) {
      const certificationAuthorities =
        await prismaClient.certificationAuthorityOnCertificationAuthorityStructure.findMany(
          {
            where: {
              certificationAuthorityStructureId:
                certificationAuthorityStructureRelation.certificationAuthorityStructureId,
            },
          },
        );

      certificationAuthorityIds = certificationAuthorities.map(
        ({ certificationAuthorityId }) => certificationAuthorityId,
      );
    }

    const whereClause: Prisma.CertificationAuthorityLocalAccountWhereInput = {
      certificationAuthorityId: { in: certificationAuthorityIds },

      account: {
        keycloakId: { not: keycloakId },
        OR: [
          {
            firstname: {
              contains: searchFilter,
              mode: "insensitive",
            },
          },
          {
            lastname: {
              contains: searchFilter,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: searchFilter,
              mode: "insensitive",
            },
          },
        ],
      },
    };

    const certificationAuthorityLocalAccountsCount =
      await prismaClient.certificationAuthorityLocalAccount.count({
        where: whereClause,
      });

    const certificationAuthorityLocalAccounts =
      await prismaClient.certificationAuthorityLocalAccount.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
      });

    return {
      rows: certificationAuthorityLocalAccounts,
      info: processPaginationInfo({
        totalRows: certificationAuthorityLocalAccountsCount,
        limit,
        offset,
      }),
    };
  };
