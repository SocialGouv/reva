import { prismaClient } from "@/prisma/client";

export const getAccountByCertificationAuthorityId = async ({
  certificationAuthorityId,
}: {
  certificationAuthorityId: string;
}) =>
  prismaClient.account.findFirst({
    where: { certificationAuthority: { id: certificationAuthorityId } },
  });
