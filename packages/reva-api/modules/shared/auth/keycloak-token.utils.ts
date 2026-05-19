import { logger } from "@/modules/shared/logger/logger";

import { getKeycloakAdmin } from "./getKeycloakAdmin";

// Erreur dédiée: Keycloak n'est pas joignable / mal configuré (5xx, timeout,
// client mal configuré...). Distincte d'un échec d'identifiants utilisateur.
// Définie ici pour garder la couche `utils/` indépendante de mercurius.
export class KeycloakUnavailableError extends Error {
  constructor(message = "Service d'authentification indisponible") {
    super(message);
    this.name = "KeycloakUnavailableError";
  }
}

// Appel l'endpoint /token de Keycloak en grant_type=password.
// Si le champ "totp" est fourni, il est transmis pour la step Conditional OTP
// (keycloak-connect.obtainDirectly ne supporte pas ce champ, on passe en raw fetch).
// Le couple (realm, clientId) est entièrement paramétré: ce helper est réutilisé
// par les modules admin et candidat.
export const callTokenEndpoint = async ({
  realm,
  clientId,
  clientSecret,
  username,
  password,
  totp,
}: {
  realm: string;
  clientId: string;
  clientSecret?: string;
  username: string;
  password: string;
  totp?: string;
}): Promise<{
  ok: boolean;
  status: number;
  grant?: {
    access_token: string;
    refresh_token: string;
    id_token: string;
  };
  error?: string;
  errorDescription?: string;
}> => {
  const serverUrl = process.env.KEYCLOAK_ADMIN_URL as string;

  const body = new URLSearchParams({
    grant_type: "password",
    client_id: clientId,
    username,
    password,
    scope: "openid",
  });
  // Le secret n'est nécessaire que pour les clients confidentiels.
  // Pour un client public, Keycloak ignore le secret.
  if (clientSecret) {
    body.set("client_secret", clientSecret);
  }
  if (totp) {
    body.set("totp", totp);
  }

  const response = await fetch(
    `${serverUrl}/realms/${realm}/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    },
  );

  if (response.ok) {
    const grant = (await response.json()) as {
      access_token: string;
      refresh_token: string;
      id_token: string;
    };
    return { ok: true, status: response.status, grant };
  }

  let error: string | undefined;
  let errorDescription: string | undefined;
  try {
    const errorPayload = (await response.json()) as {
      error?: string;
      error_description?: string;
    };
    error = errorPayload.error;
    errorDescription = errorPayload.error_description;
  } catch {
    // ignore
  }
  return { ok: false, status: response.status, error, errorDescription };
};

// RFC 6749 §5.2 : "invalid_grant" couvre mauvais mot de passe, mauvais OTP,
// compte désactivé, action requise en attente... Tous attribuables à l'utilisateur.
const isInvalidGrant = (error: string | undefined): boolean =>
  error === "invalid_grant";

// Vérifie qu'un utilisateur Keycloak a au moins un credential de type "otp".
// Sert à savoir s'il faut déclencher l'étape OTP dans le flow de connexion.
export const userHasTotpConfigured = async ({
  realm,
  userId,
}: {
  realm: string;
  userId: string;
}): Promise<boolean> => {
  try {
    const keycloakAdmin = await getKeycloakAdmin();
    const credentials = await keycloakAdmin.users.getCredentials({
      id: userId,
      realm,
    });
    return (credentials ?? []).some((c) => c.type === "otp");
  } catch (e) {
    logger.error(e);
    return false;
  }
};

// Vérifie un mot de passe via le client "password-check" dédié (sans step OTP).
// Permet de distinguer un MDP incorrect d'un OTP incorrect dans les flows
// admin/candidat. Les tokens éventuellement renvoyés sont ignorés volontairement.
// Lève `KeycloakUnavailableError` si Keycloak est injoignable / mal configuré.
export const validatePasswordOnly = async ({
  realm,
  clientId,
  userId,
  password,
}: {
  realm: string;
  clientId: string;
  userId: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; reason: "invalid_credentials" }> => {
  const keycloakAdmin = await getKeycloakAdmin();
  const user = await keycloakAdmin.users.findOne({
    id: userId,
    realm,
  });
  if (!user) {
    throw new Error(`userId ${userId} not found`);
  }

  let result: Awaited<ReturnType<typeof callTokenEndpoint>>;
  try {
    // Le password-check client est public côté admin et côté candidat.
    result = await callTokenEndpoint({
      realm,
      clientId,
      username: user.username as string,
      password,
    });
  } catch (e) {
    // Erreur réseau / DNS / TLS sur l'appel à Keycloak.
    logger.error({
      msg: "validatePasswordOnly: erreur réseau lors de l'appel à Keycloak",
      error: e,
    });
    throw new KeycloakUnavailableError();
  }

  if (result.ok) {
    return { ok: true };
  }
  if (isInvalidGrant(result.error)) {
    // Mauvais identifiants côté utilisateur : pas de log (évite le spam en prod).
    return { ok: false, reason: "invalid_credentials" };
  }
  // Toute autre réponse (5xx, code OAuth inconnu, client mal configuré...) doit être
  // remontée comme une indisponibilité afin de ne pas être confondue avec un
  // mauvais mot de passe côté utilisateur.
  logger.error({
    msg: "validatePasswordOnly: réponse inattendue de Keycloak",
    status: result.status,
    error: result.error,
    errorDescription: result.errorDescription,
  });
  throw new KeycloakUnavailableError();
};

// Mint les tokens IAM via grant_type=password (avec ou sans totp).
// Helper bas-niveau partagé: chaque module (admin / candidat) expose un wrapper
// qui binde realm + clientId + clientSecret à ses propres variables d'env.
export const generateIAMTokenWithPasswordShared = async ({
  realm,
  clientId,
  clientSecret,
  userId,
  password,
  totp,
}: {
  realm: string;
  clientId: string;
  clientSecret?: string;
  userId: string;
  password: string;
  totp?: string;
}): Promise<{
  accessToken: string;
  refreshToken: string;
  idToken: string;
}> => {
  const keycloakAdmin = await getKeycloakAdmin();

  const user = await keycloakAdmin.users.findOne({
    id: userId,
    realm,
  });

  if (!user) {
    throw new Error(`userId ${userId} not found`);
  }

  let result: Awaited<ReturnType<typeof callTokenEndpoint>>;
  try {
    result = await callTokenEndpoint({
      realm,
      clientId,
      clientSecret,
      username: user.username as string,
      password,
      totp,
    });
  } catch (e) {
    // Erreur réseau / DNS / TLS sur l'appel à Keycloak: même contrat que
    // validatePasswordOnly - on remonte une indisponibilité distincte d'un
    // échec utilisateur (mauvais MDP / mauvais OTP).
    logger.error({
      msg: "generateIAMTokenWithPasswordShared: erreur réseau lors de l'appel à Keycloak",
      error: e,
    });
    throw new KeycloakUnavailableError();
  }

  if (result.ok && result.grant) {
    return {
      accessToken: result.grant.access_token,
      refreshToken: result.grant.refresh_token,
      idToken: result.grant.id_token,
    };
  }

  if (isInvalidGrant(result.error)) {
    // Mauvais mot de passe ou mauvais OTP : pas de log (évite le spam en prod).
    if (totp) {
      throw new Error("Code de vérification (OTP) invalide");
    }
    throw new Error("Adresse électronique ou mot de passe incorrect");
  }

  // Toute autre réponse (5xx, code OAuth inconnu, client mal configuré...) doit
  // être remontée comme une indisponibilité, pour que le resolver le wrap en
  // KEYCLOAK_UNAVAILABLE au lieu d'afficher "Code de vérification incorrect".
  logger.error({
    msg: "Echec /token grant_type=password",
    status: result.status,
    totpProvided: !!totp,
    error: result.error,
    errorDescription: result.errorDescription,
  });
  throw new KeycloakUnavailableError();
};
