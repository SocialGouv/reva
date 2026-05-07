import { generateJwt, getJWTContent } from "@/modules/shared/auth/jwt.helper";

import { ClientApp } from "../account.type";

// TTL court : couvre la saisie d'un code OTP, sans bloquer durablement.
export const OTP_CHALLENGE_TTL_SECONDS = 5 * 60;

const VALID_CLIENT_APPS: ReadonlySet<ClientApp> = new Set([
  "REVA_ADMIN",
  "REVA_VAE_COLLECTIVE",
]);

type OtpChallengePayload = {
  keycloakId: string;
  clientApp: ClientApp;
  password: string;
};

export const encodeOtpChallengeToken = (payload: OtpChallengePayload): string =>
  generateJwt(payload, OTP_CHALLENGE_TTL_SECONDS);

// Renvoie null si le token est invalide / expiré / falsifié, plutôt que de
// remonter l'exception : le caller doit pouvoir distinguer "session expirée"
// d'une vraie erreur technique.
export const decodeOtpChallengeToken = (
  token: string,
): OtpChallengePayload | null => {
  try {
    const data = getJWTContent(token) as Partial<OtpChallengePayload> | null;
    if (
      !data ||
      typeof data.keycloakId !== "string" ||
      typeof data.clientApp !== "string" ||
      !VALID_CLIENT_APPS.has(data.clientApp as ClientApp) ||
      typeof data.password !== "string"
    ) {
      return null;
    }
    return {
      keycloakId: data.keycloakId,
      clientApp: data.clientApp as ClientApp,
      password: data.password,
    };
  } catch {
    return null;
  }
};
