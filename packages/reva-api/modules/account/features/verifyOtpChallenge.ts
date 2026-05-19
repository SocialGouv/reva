import { generateIAMTokenWithPasswordShared } from "@/modules/shared/auth/keycloak-token.utils";
import { decodeOtpChallengeToken } from "@/modules/shared/auth/otp-challenge.utils";

import { getAccountByKeycloakId } from "./getAccountByKeycloakId";

export const verifyOtpChallenge = async ({
  challengeToken,
  totp,
}: {
  challengeToken: string;
  totp: string;
}) => {
  const payload = decodeOtpChallengeToken(challengeToken);
  if (!payload) {
    throw new Error(
      "Session de vérification expirée, veuillez vous reconnecter",
    );
  }

  // Le challenge porte déjà (realm, clientId) côté admin: les clients
  // confidentiels (reva-admin / reva-vae-collective) partagent le même
  // KEYCLOAK_ADMIN_CLIENT_SECRET, on peut donc appeler le helper partagé
  // directement sans repasser par le wrapper "clientApp".
  const tokens = await generateIAMTokenWithPasswordShared({
    realm: payload.realm,
    clientId: payload.clientId,
    clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET as string,
    userId: payload.keycloakId,
    password: payload.password,
    totp,
  });

  const account = await getAccountByKeycloakId({
    keycloakId: payload.keycloakId,
  });
  if (!account) {
    throw new Error("Compte non trouvé");
  }

  return { tokens, account, requiresOtp: false, otpChallengeToken: null };
};
