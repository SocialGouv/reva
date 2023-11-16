import { prismaClient } from "../../../prisma/client";
import { Account } from "../account.types";

export const getAccountById = async (
  context: {
    hasRole: (role: string) => boolean;
  },
  params: {
    id: string;
  }
): Promise<Account> => {
  const { hasRole } = context;
  if (!hasRole("admin")) {
    throw new Error("Utilisateur non autorisé");
  }

  const { id } = params;

  const account = await prismaClient.account.findUnique({
    where: { id },
    include: { organism: true },
  });

  if (!account) {
    throw new Error("Compte utilisateur non trouvé");
  }

  return account;
};
