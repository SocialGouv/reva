import { prismaClient } from "@/prisma/client";

export const updatePositionnementCollaborateur = async ({
  accountId,
  organismIds,
}: {
  accountId: string;
  organismIds: string[];
}) => {
  await prismaClient.$transaction(async (tx) => {
    await tx.organismOnAccount.deleteMany({
      where: { accountId },
    });
    await tx.organismOnAccount.createMany({
      data: organismIds.map((organismId) => ({ accountId, organismId })),
    });
  });
  return prismaClient.account.findUnique({ where: { id: accountId } });
};
