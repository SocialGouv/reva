import { prismaClient } from "../../../prisma/client";

export const getCertificationAuthorityLocalAccountByCertificationAuthorityId =
  ({ certificationAuthorityId }: { certificationAuthorityId: string }) =>
    prismaClient.certificationAuthorityLocalAccount.findMany({
      where: { certificationAuthorityId },
    });
