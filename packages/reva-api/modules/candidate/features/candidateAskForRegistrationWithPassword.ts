import { isFeatureActiveForUser } from "@/modules/feature-flipping/feature-flipping.features";
import { getAccountInIAM } from "@/modules/shared/auth/auth.helper";

import { sendLoginEmail } from "../emails/sendLoginEmail";
import { sendRegistrationWithPasswordEmail } from "../emails/sendRegistrationWithPasswordEmail";

export const candidateAskForRegistrationWithPassword = async ({
  email,
}: {
  email: string;
}) => {
  const isRegisterWithPasswordEnabled = await isFeatureActiveForUser({
    feature: "ENABLE_REGISTER_WITH_PASSWORD",
  });

  if (!isRegisterWithPasswordEnabled) {
    throw new Error("L'inscription par mot de passe n'est pas activée");
  }

  const existingAccount = await getAccountInIAM(
    email,
    process.env.KEYCLOAK_APP_REALM as string,
  );

  await (existingAccount
    ? sendLoginEmail(email) // TODO: send link to the futur login page with certification selected
    : sendRegistrationWithPasswordEmail({ email }));

  return "ok";
};
