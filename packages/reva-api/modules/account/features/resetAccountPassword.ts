import {
  getAccountInIAM,
  resetPassword,
} from "@/modules/shared/auth/auth.helper";
import { getJWTContent } from "@/modules/shared/auth/jwt.helper";
import {
  ACTION_NON_RECONNUE,
  COMPTE_NON_TROUVE,
} from "@/modules/shared/errors/messages";

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
      throw new Error(COMPTE_NON_TROUVE);
    }

    const account = await getAccountByKeycloakId({
      keycloakId: iamAccount?.id || "",
    });

    if (!account) {
      throw new Error(COMPTE_NON_TROUVE);
    }

    await resetPassword(
      account.keycloakId,
      password,
      process.env.KEYCLOAK_ADMIN_REALM_REVA as string,
    );
  } else {
    throw new Error(ACTION_NON_RECONNUE);
  }
};
