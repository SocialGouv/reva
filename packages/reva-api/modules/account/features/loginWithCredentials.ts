import { ClientApp } from "../account.type";
import {
  generateIAMTokenWithPassword,
  userHasTotpConfigured,
  validatePasswordOnly,
} from "../utils/keycloak.utils";
import { encodeOtpChallengeToken } from "../utils/otp-challenge.utils";

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

  // On valide d'abord le mot de passe via le client password-check (sans OTP)
  // pour distinguer un MDP incorrect d'un OTP incorrect, puis on demande
  // l'étape OTP si l'utilisateur en a un configuré.
  // Les erreurs d'indisponibilité Keycloak (KeycloakUnavailableError) sont
  // laissées remonter telles quelles : le résolveur les transformera en
  // ErrorWithProps avec le code "KEYCLOAK_UNAVAILABLE".
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
    // On retourne un token de challenge chiffré porté par un cookie côté Next.js,
    // afin de ne pas faire transiter le mot de passe par le navigateur entre
    // les deux étapes de l'authentification.
    const otpChallengeToken = encodeOtpChallengeToken({
      keycloakId: account.keycloakId,
      clientApp,
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
