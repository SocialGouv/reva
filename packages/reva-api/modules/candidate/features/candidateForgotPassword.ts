import { getKeycloakAdmin } from "@/modules/shared/auth/getKeycloakAdmin";

import { sendForgotPasswordEmail } from "../emails/sendForgotPasswordEmail";
import { sendUnknownUserEmail } from "../emails/sendUnknownUserEmail";

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
