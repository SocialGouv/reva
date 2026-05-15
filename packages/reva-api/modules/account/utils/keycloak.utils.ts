import { getKeycloakAdmin } from "@/modules/shared/auth/getKeycloakAdmin";
import {
  ADMIN_BASE_URL,
  CANDIDATE_BASE_URL,
} from "@/modules/shared/config/config";
import { logger } from "@/modules/shared/logger/logger";

import { ClientApp } from "../account.type";

// Effaces pendant l'impersonation pour que la cible ne reutilise pas
// les tokens persistants de la session courante.
// A sync avec les utils des apps front.
const ADMIN_TOKEN_COOKIES = [
  "REVA_ADMIN_AUTH_TOKENS_ACCESS_TOKEN",
  "REVA_ADMIN_AUTH_TOKENS_REFRESH_TOKEN",
  "REVA_ADMIN_AUTH_TOKENS_ID_TOKEN",
];
const CANDIDATE_TOKEN_COOKIES = ["tokens"];

// Cookie identifie par name+path (pas de Domain cote front).
const buildClearCookieHeader = (
  name: string,
  path: string,
): [string, string] => ["set-cookie", `${name}=; Path=${path}; Max-Age=0`];

export const impersonateAccount = async (
  keycloakId: string,
): Promise<
  | {
      headers: [string, string][];
      redirect: string;
    }
  | undefined
> => {
  const { KEYCLOAK_ADMIN_REALM_REVA } = process.env;
  if (!KEYCLOAK_ADMIN_REALM_REVA) {
    throw new Error('"KEYCLOAK_ADMIN_REALM_REVA" env var is missing');
  }

  const data = await impersonate(keycloakId, KEYCLOAK_ADMIN_REALM_REVA);
  if (data) {
    const baseUrl = ADMIN_BASE_URL || "https://vae.gouv.fr/admin2";

    const clearAdminTokens = ADMIN_TOKEN_COOKIES.map((name) =>
      buildClearCookieHeader(name, "/admin2"),
    );

    // Redirige vers une entree neutre : le routing par role est fait cote
    // client apres que keycloak ait ramasse la session impersonnee via
    // check-sso. Le flag `?impersonate=1` indique au KeycloakProvider de
    // ne pas reutiliser les tokens admin persistants (qui auraient
    // court-circuite le check-sso). Le clear server-side ci-dessus est
    // best-effort : Chrome ne l'applique pas systematiquement.
    return {
      headers: [...data.headers, ...clearAdminTokens],
      redirect: `${baseUrl}/post-login?impersonate=1`,
    };
  }

  return undefined;
};

export const impersonateCandidate = async ({
  keycloakId,
  candidateId,
  candidacyId,
}: {
  keycloakId: string;
  candidateId: string;
  candidacyId?: string;
}): Promise<
  | {
      headers: [string, string][];
      redirect: string;
    }
  | undefined
> => {
  const { KEYCLOAK_APP_REALM } = process.env;
  if (!KEYCLOAK_APP_REALM) {
    throw new Error('"KEYCLOAK_APP_REALM" env var is missing');
  }

  const data = await impersonate(keycloakId, KEYCLOAK_APP_REALM);

  if (data) {
    let redirect = `${CANDIDATE_BASE_URL}/candidates/${candidateId}`;

    if (candidacyId) {
      redirect += `/candidacies/${candidacyId}`;
    }

    const clearCandidateTokens = CANDIDATE_TOKEN_COOKIES.map((name) =>
      buildClearCookieHeader(name, "/candidat"),
    );

    return {
      headers: [...data.headers, ...clearCandidateTokens],
      redirect,
    };
  }

  return undefined;
};

const impersonate = async (
  keycloakId: string,
  realm: string,
): Promise<
  | {
      headers: [string, string][];
      redirect: string;
    }
  | undefined
> => {
  try {
    const { KEYCLOAK_ADMIN_URL } = process.env;
    if (!KEYCLOAK_ADMIN_URL) {
      throw new Error('"KEYCLOAK_ADMIN_URL" env var is missing');
    }

    const keycloakAccessToken = await getKeycloakAccessToken();
    if (!keycloakAccessToken) {
      return undefined;
    }

    const response = await fetch(
      `${KEYCLOAK_ADMIN_URL}/admin/realms/${realm}/users/${keycloakId}/impersonation`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${keycloakAccessToken}`,
        },
      },
    );

    const { redirect } = (await response.json()) as any;

    const headers: [string, string][] = [];

    const domain = process.env.FRANCE_VAE_DOMAIN || "gouv.fr";
    // En dev (localhost) on laisse le cookie host-only : reva-api et Keycloak
    // partagent le host "localhost", et Chrome >= 99 rejette `Domain=localhost`.
    // En prod multi-subdomain, on force `Domain=<root>` pour que le cookie
    // atteigne aussi bien admin que Keycloak.
    const domainAttr = domain === "localhost" ? "" : ` Domain=${domain};`;

    for (const header of response.headers) {
      if (
        header[0] == "set-cookie" &&
        header[1].indexOf("KEYCLOAK_IDENTITY") != -1
      ) {
        // Cookie forwarde tel quel : Chrome refuse de remplacer un cookie
        // `Secure` existant via un Set-Cookie non-Secure ("Strict Secure
        // Cookies" / RFC 6265bis 5.5). localhost est "potentially trustworthy"
        // donc `Secure` est accepte en HTTP en dev.
        headers.push(["set-cookie", `${header[1]}${domainAttr}`]);
      }
    }

    return { headers, redirect };
  } catch (error) {
    console.error(error);

    logger.error(error);
  }

  return undefined;
};

const getKeycloakAccessToken = async (): Promise<string | undefined> => {
  try {
    const {
      KEYCLOAK_ADMIN_URL,
      KEYCLOAK_ADMIN_REALM,
      KEYCLOAK_ADMIN_CLIENTID,
      KEYCLOAK_ADMIN_CLIENT_SECRET,
    } = process.env;

    if (!KEYCLOAK_ADMIN_URL) {
      throw new Error('"KEYCLOAK_ADMIN_URL" env var is missing');
    }

    if (!KEYCLOAK_ADMIN_REALM) {
      throw new Error('"KEYCLOAK_ADMIN_REALM" env var is missing');
    }

    if (!KEYCLOAK_ADMIN_CLIENTID) {
      throw new Error('"KEYCLOAK_ADMIN_CLIENTID" env var is missing');
    }

    if (!KEYCLOAK_ADMIN_CLIENT_SECRET) {
      throw new Error('"KEYCLOAK_ADMIN_CLIENT_SECRET" env var is missing');
    }

    const response = await fetch(
      `${KEYCLOAK_ADMIN_URL}/realms/${KEYCLOAK_ADMIN_REALM}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: KEYCLOAK_ADMIN_CLIENTID,
          client_secret: KEYCLOAK_ADMIN_CLIENT_SECRET,
        }),
      },
    );

    const { access_token } = (await response.json()) as any;
    if (access_token) {
      return access_token;
    }
  } catch (error) {
    console.error(error);

    logger.error(error);
  }

  return undefined;
};

export const userHasTotpConfigured = async (
  userId: string,
): Promise<boolean> => {
  try {
    const keycloakAdmin = await getKeycloakAdmin();
    const credentials = await keycloakAdmin.users.getCredentials({
      id: userId,
      realm: process.env.KEYCLOAK_ADMIN_REALM_REVA as string,
    });
    return (credentials ?? []).some((c) => c.type === "otp");
  } catch (e) {
    logger.error(e);
    return false;
  }
};

// Appel l'endpoint /token de Keycloak en grant_type=password.
// Si le champ "totp" est fourni, il est transmis pour la step Conditional OTP
// (keycloak-connect.obtainDirectly ne supporte pas ce champ, on passe en raw fetch).
const callTokenEndpoint = async ({
  username,
  password,
  clientId,
  clientSecret,
  totp,
}: {
  username: string;
  password: string;
  clientId: string;
  clientSecret?: string;
  totp?: string;
}): Promise<{
  ok: boolean;
  status: number;
  grant?: {
    access_token: string;
    refresh_token: string;
    id_token: string;
  };
  errorDescription?: string;
}> => {
  const serverUrl = process.env.KEYCLOAK_ADMIN_URL as string;
  const realm = process.env.KEYCLOAK_ADMIN_REALM_REVA as string;

  const body = new URLSearchParams({
    grant_type: "password",
    client_id: clientId,
    username,
    password,
    scope: "openid",
  });
  // Le secret n'est nécessaire que pour les clients confidentiels.
  // Pour un client public (comme reva-admin), Keycloak ignore le secret.
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

  let errorDescription: string | undefined;
  try {
    const errorPayload = (await response.json()) as {
      error?: string;
      error_description?: string;
    };
    errorDescription = errorPayload.error_description;
  } catch {
    // ignore
  }
  return { ok: false, status: response.status, errorDescription };
};

// Erreur dédiée: Keycloak n'est pas joignable / mal configuré (5xx, timeout,
// client mal configuré...). Distincte d'un échec d'identifiants utilisateur.
// Définie ici pour garder la couche `utils/` indépendante de mercurius.
export class KeycloakUnavailableError extends Error {
  constructor(message = "Service d'authentification indisponible") {
    super(message);
    this.name = "KeycloakUnavailableError";
  }
}

// Vérifie le mot de passe via le client dédié "password-check" (sans step OTP).
// Permet de distinguer un MDP incorrect d'un OTP incorrect dans le flow admin.
// Les tokens éventuellement renvoyés sont ignorés volontairement: ce client
// ne sert qu'à valider le mot de passe.
export const validatePasswordOnly = async (
  userId: string,
  password: string,
): Promise<{ ok: true } | { ok: false; reason: "invalid_credentials" }> => {
  const clientId = process.env
    .KEYCLOAK_ADMIN_CLIENTID_REVA_PASSWORD_CHECK as string;

  if (!clientId) {
    throw new Error(
      "Configuration manquante: KEYCLOAK_ADMIN_CLIENTID_REVA_PASSWORD_CHECK",
    );
  }

  const keycloakAdmin = await getKeycloakAdmin();
  const user = await keycloakAdmin.users.findOne({
    id: userId,
    realm: process.env.KEYCLOAK_ADMIN_REALM_REVA as string,
  });
  if (!user) {
    throw new Error(`userId ${userId} not found`);
  }

  let result: Awaited<ReturnType<typeof callTokenEndpoint>>;
  try {
    // Client public, pas de secret à transmettre.
    result = await callTokenEndpoint({
      username: user.username as string,
      password,
      clientId,
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
  if (result.status === 401) {
    return { ok: false, reason: "invalid_credentials" };
  }
  // Tout autre statut (4xx hors 401, 5xx, client mal configuré...) doit être
  // remonté comme une indisponibilité afin de ne pas être confondu avec un
  // mauvais mot de passe côté utilisateur.
  logger.error({
    msg: "validatePasswordOnly: réponse inattendue de Keycloak",
    status: result.status,
    errorDescription: result.errorDescription,
  });
  throw new KeycloakUnavailableError();
};

export const generateIAMTokenWithPassword = async (
  userId: string,
  password: string,
  clientApp: ClientApp,
  totp?: string,
) => {
  const keycloakAdmin = await getKeycloakAdmin();

  const user = await keycloakAdmin.users.findOne({
    id: userId,
    realm: process.env.KEYCLOAK_ADMIN_REALM_REVA as string,
  });

  if (!user) {
    throw new Error(`userId ${userId} not found`);
  }

  let clientId = "";
  if (clientApp === "REVA_ADMIN") {
    clientId = process.env.KEYCLOAK_ADMIN_CLIENTID_REVA as string;
  } else if (clientApp === "REVA_VAE_COLLECTIVE") {
    clientId = process.env
      .KEYCLOAK_ADMIN_CLIENTID_REVA_VAE_COLLECTIVE as string;
  }
  const clientSecret = process.env.KEYCLOAK_ADMIN_CLIENT_SECRET as string;

  let result: Awaited<ReturnType<typeof callTokenEndpoint>>;
  try {
    result = await callTokenEndpoint({
      username: user.username as string,
      password,
      clientId,
      clientSecret,
      totp,
    });
  } catch (e) {
    logger.error(e);
    throw new Error("Erreur lors de la génération du token IAM");
  }

  if (result.ok && result.grant) {
    return {
      accessToken: result.grant.access_token,
      refreshToken: result.grant.refresh_token,
      idToken: result.grant.id_token,
    };
  }

  logger.error({
    msg: "Echec /token grant_type=password",
    status: result.status,
    totpProvided: !!totp,
    error_description: result.errorDescription,
  });

  if (totp) {
    throw new Error("Code de vérification (OTP) invalide");
  }
  throw new Error("Erreur lors de la génération du token IAM");
};
