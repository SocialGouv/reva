import { updateAccountById } from "../../account/features/updateAccount";
import { getAccountByOrganismId } from "./getAccountByOrganismId";
import { UpdateOrganismAccountInput } from "../organism.types";

export const updateOrganismAccount = async ({
  params: { organismId, accountEmail, accountFirstname, accountLastname },
}: {
  params: UpdateOrganismAccountInput;
}) => {
  const account = await getAccountByOrganismId({ organismId });

  if (!account) {
    throw Error("Compte utilisateur non trouvé");
  }

  return updateAccountById({
    accountId: account.id,
    accountData: {
      email: accountEmail,
      firstname: accountFirstname,
      lastname: accountLastname,
    },
  });
};
