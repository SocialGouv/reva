import { generateIAMTokenWithPasswordShared } from "@/modules/shared/auth/keycloak-token.utils";
import { decodeOtpChallengeToken } from "@/modules/shared/auth/otp-challenge.utils";

import { getAccountByKeycloakId } from "./getAccountByKeycloakId";

export const verifyOtpChallenge = async ({
  challengeToken,
  otp,
}: {
  challengeToken: string;
  otp: string;
}) => {
  const payload = decodeOtpChallengeToken(challengeToken);
  if (!payload) {
    throw new Error(
      "Session de vérification expirée, veuillez vous reconnecter",
    );
  }

  // Secret partagé entre reva-admin et reva-vae-collective: pas besoin du wrapper clientApp.
  const tokens = await generateIAMTokenWithPasswordShared({
    realm: payload.realm,
    clientId: payload.clientId,
    clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET as string,
    userId: payload.keycloakId,
    password: payload.password,
    totp: otp,
  });

  const account = await getAccountByKeycloakId({
    keycloakId: payload.keycloakId,
  });
  if (!account) {
    throw new Error("Compte non trouvé");
  }

  return { tokens, account, requiresOtp: false, otpChallengeToken: null };
};
