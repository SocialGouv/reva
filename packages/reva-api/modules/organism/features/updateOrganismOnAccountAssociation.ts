import { prismaClient } from "@/prisma/client";

export const updateOrganismOnAccountAssociation = async ({
  accountId,
  organismIds,
}: {
  accountId: string;
  organismIds: string[];
}) => {
  await prismaClient.organismOnAccount.deleteMany({
    where: {
      accountId,
    },
  });

  return prismaClient.organismOnAccount.createMany({
    data: organismIds.map((organismId) => ({
      accountId,
      organismId: organismId,
    })),
  });
};
