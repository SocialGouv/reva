import { prismaClient } from "../../../prisma/client";

export const updateMaisonMereOrganismsIsActive = async ({
  isActive,
  maisonMereAAPId,
}: {
  isActive: boolean;
  maisonMereAAPId: string;
}) => {
  await prismaClient.$transaction(async (tx) => {
    await tx.maisonMereAAP.update({
      where: {
        id: maisonMereAAPId,
      },
      data: {
        isActive,
      },
    });

    await tx.organism.updateMany({
      where: {
        maisonMereAAPId,
      },
      data: {
        isActive,
      },
    });
  });
};
