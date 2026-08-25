import { prismaClient } from "@/prisma/client";

export const isAccountEmailAlreadyUsed = async ({
  accountEmail,
  excludedAccountId,
}: {
  accountEmail: string;
  // Un compte qui change d'adresse ne se concurrence pas lui-même.
  excludedAccountId?: string;
}) => {
  const account = await prismaClient.account.findFirst({
    where: {
      // Même recherche que getAccountByEmail, qui s'aligne sur Keycloak: sinon un
      // conflit en casse mixte n'est signalé qu'au moment où il fait échouer la mise à jour.
      email: { equals: accountEmail, mode: "insensitive" },
      id: excludedAccountId ? { not: excludedAccountId } : undefined,
    },
  });
  return !!account;
};
