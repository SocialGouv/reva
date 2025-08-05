import {
  getAccountInIAM,
  getJWTContent,
  resetPassword,
} from "@/modules/shared/auth/auth.helper";

import { getAccountByKeycloakId } from "./getAccountByKeycloakId";

export const resetAccountPassword = async ({
  token,
  password,
}: {
  token: string;
  password: string;
}) => {
  const { email, action } = (await getJWTContent(token)) as {
    email: string;
    action: string;
  };

  if (action === "reset-password") {
    const iamAccount = await getAccountInIAM(
      email,
      process.env.KEYCLOAK_ADMIN_REALM_REVA as string,
    );

    if (!iamAccount) {
      throw new Error(`Compte non trouvé`);
    }

    const account = await getAccountByKeycloakId({
      keycloakId: iamAccount?.id || "",
    });

    if (!account) {
      throw new Error("Compte non trouvé");
    }

    await resetPassword(
      account.keycloakId,
      password,
      process.env.KEYCLOAK_ADMIN_REALM_REVA as string,
    );
  } else {
    throw new Error(`Action non reconnue`);
  }
};
