import mercurius from "mercurius";

import { KeycloakUnavailableError } from "./keycloak-token.utils";

// Wrap les features qui peuvent lever `KeycloakUnavailableError`: l'erreur est
// transformée en `mercurius.ErrorWithProps` avec le code "KEYCLOAK_UNAVAILABLE",
// afin que le front puisse distinguer une indisponibilité d'un mauvais MDP /
// mauvais OTP. Toute autre exception est propagée telle quelle.
export const wrapKeycloakUnavailable = async <T>(
  fn: () => Promise<T>,
): Promise<T> => {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof KeycloakUnavailableError) {
      throw new mercurius.ErrorWithProps(
        "Service d'authentification indisponible, merci de réessayer plus tard.",
        { code: "KEYCLOAK_UNAVAILABLE" },
      );
    }
    throw e;
  }
};
