import { logger } from "@/modules/shared/logger/logger";

import { getKeycloakAdmin } from "./getKeycloakAdmin";

// Distincte d'un échec d'identifiants utilisateur (5xx, timeout, client mal configuré...).
export class KeycloakUnavailableError extends Error {
  constructor(message = "Service d'authentification indisponible") {
    super(message);
    this.name = "KeycloakUnavailableError";
  }
}

// Raw fetch (pas keycloak-connect.obtainDirectly) car ce dernier ne supporte
// pas le champ `totp` requis pour la step Conditional OTP.
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
  // Secret requis uniquement pour les clients confidentiels.
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

//Vérifie la validité d'un access token auprès de Keycloak via /userinfo.
export const verifyAccessToken = async ({
  realm,
  accessToken,
}: {
  realm: string;
  accessToken: string;
}): Promise<boolean> => {
  const serverUrl = process.env.KEYCLOAK_ADMIN_URL as string;
  try {
    const response = await fetch(
      `${serverUrl}/realms/${realm}/protocol/openid-connect/userinfo`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return response.ok;
  } catch (e) {
    logger.error(e);
    return false;
  }
};

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

// Via un client "password-check" sans step OTP, pour distinguer un MDP
// incorrect d'un OTP incorrect. Les tokens renvoyés sont ignorés.
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
    result = await callTokenEndpoint({
      realm,
      clientId,
      username: user.username as string,
      password,
    });
  } catch (e) {
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
    // Pas de log: mauvais identifiants côté utilisateur, évite le spam en prod.
    return { ok: false, reason: "invalid_credentials" };
  }
  // Toute autre réponse (5xx, OAuth inconnu, client mal configuré) doit
  // remonter comme indisponibilité, pour ne pas être confondue avec un MDP incorrect.
  logger.error({
    msg: "validatePasswordOnly: réponse inattendue de Keycloak",
    status: result.status,
    error: result.error,
    errorDescription: result.errorDescription,
  });
  throw new KeycloakUnavailableError();
};

// Mint les tokens IAM via grant_type=password (avec ou sans totp).
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
    // Pas de log: mauvais MDP ou mauvais OTP côté utilisateur.
    if (totp) {
      throw new Error("Code de vérification (OTP) invalide");
    }
    throw new Error("Adresse électronique ou mot de passe incorrect");
  }

  // Toute autre réponse remonte comme indisponibilité (sinon le front affiche
  // "Code de vérification incorrect" sur une vraie panne Keycloak).
  logger.error({
    msg: "Echec /token grant_type=password",
    status: result.status,
    totpProvided: !!totp,
    error: result.error,
    errorDescription: result.errorDescription,
  });
  throw new KeycloakUnavailableError();
};
