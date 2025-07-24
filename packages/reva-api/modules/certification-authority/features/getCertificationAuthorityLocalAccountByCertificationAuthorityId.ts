import { prismaClient } from "@/prisma/client";

export const getCertificationAuthorityLocalAccountByCertificationAuthorityId =
  ({ certificationAuthorityId }: { certificationAuthorityId: string }) =>
    prismaClient.certificationAuthority
      .findUnique({ where: { id: certificationAuthorityId } })
      .certificationAuthorityLocalAccount();
