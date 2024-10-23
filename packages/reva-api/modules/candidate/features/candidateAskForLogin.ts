import { getKeycloakAdmin } from "../../account/features/getKeycloakAdmin";
import { generateJwt } from "../auth.helper";
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
    const token = generateJwt({ email, action: "login" }, 1 * 60 * 60);
    return sendLoginEmail(email, token);
  } else {
    return sendUnknownUserEmail(email);
  }
};
