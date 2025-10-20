import { prismaClient } from "@/prisma/client";

export const updateOrganismOnAccountAssociation = async ({
  accountId,
  organismId,
}: {
  accountId: string;
  organismId: string;
}) => {
  //TODO remove this when we allow on account to be linked to multiple organisms
  await prismaClient.organismOnAccount.deleteMany({
    where: {
      accountId,
    },
  });

  //TODO rework this when we allow on account to be linked to multiple organisms
  return prismaClient.organismOnAccount.create({
    data: {
      accountId,
      organismId,
    },
  });
};
