import { MaisonMereAAP } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export const getMaisonMereAAPByGestionnaireAccountIdOrCollaborateurAccountId =
  async ({ accountId }: { accountId: string }) => {
    let maisonMereAAP: MaisonMereAAP | null | undefined = null;

    maisonMereAAP = await prismaClient.maisonMereAAP.findUnique({
      where: { gestionnaireAccountId: accountId },
    });

    if (!maisonMereAAP) {
      maisonMereAAP = await prismaClient.maisonMereAAPOnAccount
        .findUnique({
          where: { accountId },
          include: {
            maisonMereAAP: true,
          },
        })
        .then((moa) => moa?.maisonMereAAP);
    }

    return maisonMereAAP;
  };
