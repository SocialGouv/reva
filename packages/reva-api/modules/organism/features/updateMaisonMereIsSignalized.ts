import { prismaClient } from "../../../prisma/client";

export const updateMaisonMereIsSignalized = async ({
  isSignalized,
  maisonMereAAPId,
}: {
  isSignalized: boolean;
  maisonMereAAPId: string;
}) => {
  await prismaClient.maisonMereAAP.update({
    where: {
      id: maisonMereAAPId,
    },
    data: {
      isSignalized,
    },
  });
};
