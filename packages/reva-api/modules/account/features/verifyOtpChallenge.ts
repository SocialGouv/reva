import { generateIAMTokenWithPassword } from "../utils/keycloak.utils";
import { decodeOtpChallengeToken } from "../utils/otp-challenge.utils";

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

  const tokens = await generateIAMTokenWithPassword(
    payload.keycloakId,
    payload.password,
    payload.clientApp,
    totp,
  );

  const account = await getAccountByKeycloakId({
    keycloakId: payload.keycloakId,
  });
  if (!account) {
    throw new Error("Compte non trouvé");
  }

  return { tokens, account, requiresOtp: false, otpChallengeToken: null };
};
