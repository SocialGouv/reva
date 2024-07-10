import { prismaClient } from "../../../prisma/client";

export const updateMaisonMereAccountSetup = async ({
  showAccountSetup,
  maisonMereAAPId,
}: {
  showAccountSetup: boolean;
  maisonMereAAPId: string;
}) => {
  const maisonMereAap = await prismaClient.maisonMereAAP.update({
    where: {
      id: maisonMereAAPId,
    },
    data: {
      showAccountSetup,
    },
  });
  return maisonMereAap;
};
