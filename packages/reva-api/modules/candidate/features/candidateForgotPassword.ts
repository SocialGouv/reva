import { getKeycloakAdmin } from "../../account/features/getKeycloakAdmin";
import { sendForgotPasswordEmail, sendUnknownUserEmail } from "../emails";

export const candidateForgotPassword = async (email: string) => {
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
    await sendForgotPasswordEmail(email);
  } else {
    await sendUnknownUserEmail(email);
  }
};
