import { getAccountFromEmail } from "../database/accounts";
import { generateIAMTokenWithPassword } from "../utils/keycloak.utils";

export const loginWithCredentials = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const account = await getAccountFromEmail(email);

  if (!account) {
    throw new Error("Compte non trouvé");
  }

  const tokens = await generateIAMTokenWithPassword(
    account.keycloakId,
    password,
  );

  return {
    tokens,
    account,
  };
};
