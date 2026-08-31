import { createAccount } from "@/modules/account/features/createAccount";
import { prismaClient } from "@/prisma/client";

export const createSousCompteVaeCollective = async ({
  commanditaireVaeCollectiveId,
  accountFirstname,
  accountLastname,
  accountEmail,
}: {
  commanditaireVaeCollectiveId: string;
  accountFirstname: string;
  accountLastname: string;
  accountEmail: string;
}) => {
  const account = await createAccount({
    email: accountEmail,
    username: accountEmail,
    firstname: accountFirstname,
    lastname: accountLastname,
    group: "sous_compte_vae_collective",
  });

  const sousCompteVaeCollective =
    await prismaClient.sousCompteVaeCollective.create({
      data: {
        commanditaireVaeCollectiveId: commanditaireVaeCollectiveId,
        accountId: account.id,
      },
    });

  return sousCompteVaeCollective;
};
