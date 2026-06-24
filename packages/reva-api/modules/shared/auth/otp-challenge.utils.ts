import { generateJwt, getJWTContent } from "./jwt.helper";

const AUTHENTICATOR_OTP_CHALLENGE_EXPIRES_IN = 5 * 60;
const EMAIL_OTP_CHALLENGE_EXPIRES_IN = 10 * 60;

// Le mot de passe est embarqué chiffré dans le token, jamais exposé en clair
// au navigateur entre les deux étapes du flow.
type OtpChallengePayload = {
  keycloakId: string;
  realm: string;
  clientId: string;
  password: string;
};

export const encodeOtpChallengeToken = ({
  payload,
  otpType,
}: {
  payload: OtpChallengePayload;
  otpType: "authenticator" | "email";
}): string => {
  let expiresIn = 0;
  switch (otpType) {
    case "authenticator":
      expiresIn = AUTHENTICATOR_OTP_CHALLENGE_EXPIRES_IN;
      break;
    case "email":
      expiresIn = EMAIL_OTP_CHALLENGE_EXPIRES_IN;
      break;
  }
  return generateJwt(payload, expiresIn);
};

// Renvoie null (token invalide / expiré / falsifié) plutôt que de throw:
// le caller doit pouvoir distinguer "session expirée" d'une erreur technique.
export const decodeOtpChallengeToken = (
  token: string,
): OtpChallengePayload | null => {
  try {
    const data = getJWTContent(token) as Partial<OtpChallengePayload> | null;
    if (
      !data ||
      typeof data.keycloakId !== "string" ||
      typeof data.realm !== "string" ||
      typeof data.clientId !== "string" ||
      typeof data.password !== "string"
    ) {
      return null;
    }
    return {
      keycloakId: data.keycloakId,
      realm: data.realm,
      clientId: data.clientId,
      password: data.password,
    };
  } catch {
    return null;
  }
};
