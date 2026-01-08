import { disableAccountById } from "@/modules/account/features/disableAccount";
import { prismaClient } from "@/prisma/client";

export const disableCompteCollaborateur = async ({
  maisonMereAAPId,
  accountId,
}: {
  maisonMereAAPId: string;
  accountId: string;
}) => {
  const accountMaisonMereAAPLink =
    await prismaClient.maisonMereAAPOnAccount.findUnique({
      where: {
        maisonMereAAPId,
        accountId,
      },
    });

  if (!accountMaisonMereAAPLink) {
    throw new Error("Le compte collaborateur n'est pas lié à la maison mère");
  }

  return disableAccountById({ accountId });
};
