import mercurius from "mercurius";

import { KeycloakUnavailableError } from "./keycloak-token.utils";

// Transforme `KeycloakUnavailableError` en `ErrorWithProps` code "KEYCLOAK_UNAVAILABLE"
// pour que le front distingue une indisponibilité d'un mauvais MDP/OTP.
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
