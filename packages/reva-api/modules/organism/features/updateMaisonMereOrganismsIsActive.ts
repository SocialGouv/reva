import { prismaClient } from "../../../prisma/client";

export const updateMaisonMereOrganismsIsActive = async ({
  isActive,
  maisonMereAAPId,
}: {
  isActive: boolean;
  maisonMereAAPId: string;
}) => {
  await prismaClient.maisonMereAAP.update({
    where: {
      id: maisonMereAAPId,
    },
    data: {
      isActive,
    },
  });
};
