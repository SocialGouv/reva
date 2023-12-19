import { prismaClient } from "../../../prisma/client";

export const getCertificationRelationsByCertificationAuthorityLocalAccountIds =
  ({
    certificationAuthorityLocalAccountIds,
  }: {
    certificationAuthorityLocalAccountIds: string[];
  }) =>
    prismaClient.certificationAuthorityLocalAccountOnCertification.findMany({
      where: {
        certificationAuthorityLocalAccountId: {
          in: certificationAuthorityLocalAccountIds,
        },
      },
      include: { certification: true },
    });
