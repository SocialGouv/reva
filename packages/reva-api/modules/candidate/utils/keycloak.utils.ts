import {
  generateIAMTokenWithPasswordShared,
  userHasTotpConfigured as userHasTotpConfiguredShared,
  validatePasswordOnly as validatePasswordOnlyShared,
} from "@/modules/shared/auth/keycloak-token.utils";

// Nom fixe dans tous les environnements: doit matcher le clientId
// créé dans la console Keycloak.
const CANDIDATE_PASSWORD_CHECK_CLIENT_ID = "reva-app-password-check";

export const candidateUserHasTotpConfigured = async (
  userId: string,
): Promise<boolean> => {
  return userHasTotpConfiguredShared({
    realm: process.env.KEYCLOAK_APP_REALM as string,
    userId,
  });
};

export const validateCandidatePasswordOnly = async (
  userId: string,
  password: string,
): Promise<{ ok: true } | { ok: false; reason: "invalid_credentials" }> => {
  return validatePasswordOnlyShared({
    realm: process.env.KEYCLOAK_APP_REALM as string,
    clientId: CANDIDATE_PASSWORD_CHECK_CLIENT_ID,
    userId,
    password,
  });
};

// Même client `reva-app` pour la branche sans OTP et post-OTP: les tokens
// gardent `azp = reva-app` et le refresh keycloak-js continue de fonctionner.
export const generateCandidateIAMTokenWithPassword = async (
  userId: string,
  password: string,
  totp?: string,
) => {
  return generateIAMTokenWithPasswordShared({
    realm: process.env.KEYCLOAK_APP_REALM as string,
    clientId: process.env.KEYCLOAK_APP_REVA_APP as string,
    clientSecret: process.env.KEYCLOAK_APP_ADMIN_CLIENT_SECRET as string,
    userId,
    password,
    totp,
  });
};
