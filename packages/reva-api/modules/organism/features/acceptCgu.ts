import { prismaClient } from "../../../prisma/client";

export const acceptCgu = async (context: {
  hasRole: (role: string) => boolean;
  keycloakId: string;
}): Promise<boolean> => {
  const { hasRole, keycloakId } = context;
  if (!hasRole("gestion_maison_mere_aap")) {
    throw new Error("Utilisateur non autorisé");
  }

  const account = await prismaClient.account.findUnique({
    where: { keycloakId },
    select: {
      organism: {
        select: {
          maisonMereAAPId: true,
        },
      },
    },
  });

  if (!account) {
    throw new Error(`Compte non trouvé`);
  }

  const maisonMereAAPId = account.organism?.maisonMereAAPId;
  if (!maisonMereAAPId) {
    throw new Error(`Maison mère AAP non trouvé`);
  }

  await prismaClient.maisonMereAAP.update({
    where: { id: maisonMereAAPId },
    data: {
      cguVersion: 1,
      cguAcceptedAt: new Date(),
    },
  });

  return true;
};
