import {
  generateIAMTokenWithPasswordShared,
  userHasTotpConfigured as userHasTotpConfiguredShared,
  validatePasswordOnly as validatePasswordOnlyShared,
} from "@/modules/shared/auth/keycloak-token.utils";

// Le client password-check candidat porte le même nom dans toutes les
// environnements (dev / staging / preprod / prod). Aucune variable d'env
// dédiée : on évite de la surface de provisioning pour un nom fixe.
// Doit matcher byte-for-byte le clientId créé dans la console Keycloak
// (voir Phase 1 du plan 048-candidate-otp).
const CANDIDATE_PASSWORD_CHECK_CLIENT_ID = "reva-app-password-check";

// Wrapper candidat: binde le realm `KEYCLOAK_APP_REALM` au helper partagé.
export const candidateUserHasTotpConfigured = async (
  userId: string,
): Promise<boolean> => {
  return userHasTotpConfiguredShared({
    realm: process.env.KEYCLOAK_APP_REALM as string,
    userId,
  });
};

// Vérifie le mot de passe d'un candidat via `reva-app-password-check` (client
// public, sans step OTP). Permet de distinguer un MDP incorrect d'un OTP
// incorrect dans le flow candidat. Lève `KeycloakUnavailableError` si
// Keycloak est injoignable / mal configuré.
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

// Mint les tokens IAM candidat via `reva-app` (avec ou sans totp).
// `reva-app` est confidentiel (même config que `reva-admin`): on transmet
// `KEYCLOAK_APP_ADMIN_CLIENT_SECRET` à l'endpoint /token. Le même client est
// utilisé pour la branche sans OTP et la branche post-vérification OTP, afin
// que les tokens portent toujours `azp = reva-app` et que le refresh
// keycloak-js continue de fonctionner sans modification.
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
