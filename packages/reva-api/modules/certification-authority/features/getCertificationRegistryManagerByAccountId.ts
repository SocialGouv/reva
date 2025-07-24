import { prismaClient } from "@/prisma/client";

export const getCertificationRegistryManagerByAccountId = ({
  accountId,
}: {
  accountId: string;
}) =>
  prismaClient.certificationRegistryManager.findFirst({
    where: { accountId },
  });
