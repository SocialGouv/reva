import { prismaClient } from "@/prisma/client";

export const getHumanAccountByCertificationAuthorityLocalAccountId = async ({
  certificationAuthorityLocalAccountId,
}: {
  certificationAuthorityLocalAccountId: string;
}) =>
  prismaClient.account.findFirst({
    where: {
      certificationAuthorityLocalAccountId,
      isApiUser: false,
    },
  });
