import { ClientApp } from "../account.type";
import { getAccountFromEmail } from "../database/accounts";
import { generateIAMTokenWithPassword } from "../utils/keycloak.utils";

export const loginWithCredentials = async ({
  email,
  password,
  clientApp,
}: {
  email: string;
  password: string;
  clientApp: ClientApp;
}) => {
  const account = await getAccountFromEmail(email);

  if (!account) {
    throw new Error("Compte non trouvé");
  }

  const tokens = await generateIAMTokenWithPassword(
    account.keycloakId,
    password,
    clientApp,
  );

  return {
    tokens,
    account,
  };
};
