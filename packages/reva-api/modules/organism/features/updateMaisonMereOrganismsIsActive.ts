import { prismaClient } from "../../../prisma/client";

export const updateMaisonMereOrganismsIsActive = async ({
  isActive,
  maisonMereAAPId,
}: {
  isActive: boolean;
  maisonMereAAPId: string;
}) => {
  await prismaClient.organism.updateMany({
    where: {
      maisonMereAAPId,
    },
    data: {
      isActive,
    },
  });
};