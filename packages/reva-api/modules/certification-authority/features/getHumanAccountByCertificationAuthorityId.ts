import { prismaClient } from "@/prisma/client";

export const getHumanAccountByCertificationAuthorityId = async ({
  certificationAuthorityId,
}: {
  certificationAuthorityId: string;
}) =>
  prismaClient.account.findFirst({
    where: {
      certificationAuthority: { id: certificationAuthorityId },
      isApiUser: false,
    },
  });
