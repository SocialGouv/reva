import { isAccountEmailAlreadyUsed } from "@/modules/account/features/isAccountEmailAlreadyUsed";
import { prismaClient } from "@/prisma/client";

// L'adresse en attente est déjà celle du compte gestionnaire tant que la demande
// n'est pas validée: c'est ce compte-là qu'il faut exclure de la recherche.
export const isPendingGestionnaireEmailAlreadyUsed = async ({
  maisonMereAAPId,
  gestionnaireEmail,
}: {
  maisonMereAAPId: string;
  gestionnaireEmail: string;
}) => {
  const maisonMereAAP = await prismaClient.maisonMereAAP.findUnique({
    where: { id: maisonMereAAPId },
    select: { gestionnaireAccountId: true },
  });

  return isAccountEmailAlreadyUsed({
    accountEmail: gestionnaireEmail,
    excludedAccountId: maisonMereAAP?.gestionnaireAccountId ?? undefined,
  });
};
