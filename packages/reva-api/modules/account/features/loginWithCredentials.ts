import { ClientApp } from "../account.type";
import { getAccountByEmail } from "./getAccountByEmail";
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
  const account = await getAccountByEmail(email);

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
