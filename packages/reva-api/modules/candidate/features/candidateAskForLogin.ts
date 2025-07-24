import { getKeycloakAdmin } from "@/modules/account/features/getKeycloakAdmin";

import { sendLoginEmail, sendUnknownUserEmail } from "../emails";

export const askForLogin = async (email: string) => {
  const keycloakAdmin = await getKeycloakAdmin();

  const doesUserExists = !!(
    await keycloakAdmin.users.find({
      max: 1,
      realm: process.env.KEYCLOAK_APP_REALM,
      email,
      exact: true,
    })
  ).length;

  if (doesUserExists) {
    await sendLoginEmail(email);
  } else {
    await sendUnknownUserEmail(email);
  }
  return "OK";
};
