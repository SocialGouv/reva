import { prismaClient } from "@/prisma/client";

import { getLastProfessionalCgu } from "./getLastProfessionalCgu";

export const acceptCgu = async (context: {
  hasRole: (role: string) => boolean;
  keycloakId: string;
}): Promise<boolean> => {
  const { hasRole, keycloakId } = context;
  if (!hasRole("gestion_maison_mere_aap")) {
    throw new Error("Utilisateur non autorisé");
  }

  const lastProfessionalCgu = await getLastProfessionalCgu();
  if (!lastProfessionalCgu) {
    return true;
  }

  const account = await prismaClient.account.findUnique({
    where: { keycloakId },
    select: {
      organismOnAccounts: {
        select: {
          organism: {
            select: {
              maisonMereAAP: {
                select: {
                  id: true,
                  cguVersion: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!account) {
    throw new Error(`Compte utilisateur non trouvé`);
  }

  // un compte peut être associé à plusieurs organismes mais ils auront tous la meme maison mère AAP
  // on peut donc prendre la première maison mère AAP associée au compte
  const maisonMereAAP = account.organismOnAccounts[0].organism?.maisonMereAAP;
  if (!maisonMereAAP) {
    throw new Error(`Maison mère AAP non trouvée`);
  }

  if (maisonMereAAP.cguVersion == lastProfessionalCgu.version) {
    throw new Error(`La dernière version des CGU a déjà été acceptée.`);
  }

  await prismaClient.maisonMereAAP.update({
    where: { id: maisonMereAAP.id },
    data: {
      cguVersion: lastProfessionalCgu.version,
      cguAcceptedAt: new Date(),
    },
  });

  return true;
};
