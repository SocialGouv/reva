import { encodeOtpChallengeToken } from "@/modules/shared/auth/otp-challenge.utils";

import { ClientApp } from "../account.type";
import {
  generateIAMTokenWithPassword,
  getAdminClientIdFor,
  userHasTotpConfigured,
  validatePasswordOnly,
} from "../utils/keycloak.utils";

import { getAccountByEmail } from "./getAccountByEmail";

export const loginWithCredentials = async ({
  email,
  password,
  clientApp,
}: {
  email: string;
  password: string;
  clientApp: ClientApp;
}) => {
  const account = await getAccountByEmail(email);

  if (!account) {
    throw new Error("Compte non trouvé");
  }

  // Valide le MDP d'abord pour distinguer un MDP incorrect d'un OTP incorrect,
  // puis demande l'étape OTP si l'utilisateur en a un configuré.
  const passwordResult = await validatePasswordOnly(
    account.keycloakId,
    password,
  );
  if (!passwordResult.ok) {
    throw new Error("Adresse électronique ou mot de passe incorrect");
  }

  const isUserHasTotpConfigured = await userHasTotpConfigured(
    account.keycloakId,
  );

  if (isUserHasTotpConfigured) {
    // Challenge chiffré porté par cookie Next.js: le MDP ne transite pas
    // par le navigateur entre les deux étapes.
    const otpChallengeToken = encodeOtpChallengeToken({
      keycloakId: account.keycloakId,
      realm: process.env.KEYCLOAK_ADMIN_REALM_REVA as string,
      clientId: getAdminClientIdFor(clientApp),
      password,
    });
    return {
      tokens: null,
      account,
      requiresOtp: true,
      otpChallengeToken,
    };
  }

  const tokens = await generateIAMTokenWithPassword(
    account.keycloakId,
    password,
    clientApp,
  );

  return { tokens, account, requiresOtp: false, otpChallengeToken: null };
};
