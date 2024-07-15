import { UpdateOrganimsAccountAndOrganismInput } from "../organism.types";
import { updateAccountById } from "../..//account/features/updateAccount";
import { prismaClient } from "../../../prisma/client";
import { getAccountById } from "../../account/features/getAccount";

export const updateOrganismAccountAndOrganism = async ({
  accountId,
  accountEmail,
  accountFirstname,
  accountLastname,
  organismId,
}: UpdateOrganimsAccountAndOrganismInput) => {
  const account = await getAccountById({
    id: accountId,
  });

  if (!account) {
    throw Error("Compte utilisateur non trouvé");
  }

  await updateAccountById({
    accountId: account.id,
    accountData: {
      email: accountEmail,
      firstname: accountFirstname,
      lastname: accountLastname,
    },
  });

  return prismaClient.account.update({
    where: { id: account.id },
    data: { organismId },
  });
};
