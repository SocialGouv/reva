import { prismaClient } from "../../../prisma/client";

export const getCertificationAuthorityLocalAccountByCertificationAuthorityIds =
  ({ certificationAuthorityIds }: { certificationAuthorityIds: string[] }) =>
    prismaClient.certificationAuthorityLocalAccount.findMany({
      where: { certificationAuthorityId: { in: certificationAuthorityIds } },
    });
