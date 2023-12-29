import { prismaClient } from "../../../prisma/client";
import { Account } from "../account.types";

export const getAccountById = async (params: {
  id: string;
}): Promise<Account> => {
  const { id } = params;

  const account = await prismaClient.account.findUnique({
    where: { id },
  });

  if (!account) {
    throw new Error("Compte utilisateur non trouvé");
  }

  return account;
};
