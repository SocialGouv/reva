import {
  generateIAMTokenWithPasswordShared,
  userHasTotpConfigured as userHasTotpConfiguredShared,
  validatePasswordOnly as validatePasswordOnlyShared,
} from "@/modules/shared/auth/keycloak-token.utils";
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
    // atteigne aussi bien admin que Keycloak. Prefixe par "; " obligatoire :
    // le cookie de Keycloak ne se termine pas forcement par ";" et sans
    // separateur le browser parse `SameSite=None Domain=...` comme une seule
    // valeur invalide → cookie stocke en host-only au lieu de cross-subdomain.
    const domainAttr = domain === "localhost" ? "" : `; Domain=${domain}`;

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

// Wrapper admin: binde le realm `KEYCLOAK_ADMIN_REALM_REVA` au helper partagé.
export const userHasTotpConfigured = async (
  userId: string,
): Promise<boolean> => {
  return userHasTotpConfiguredShared({
    realm: process.env.KEYCLOAK_ADMIN_REALM_REVA as string,
    userId,
  });
};

// Wrapper admin: binde le client password-check via la variable d'env dédiée
// `KEYCLOAK_ADMIN_CLIENTID_REVA_PASSWORD_CHECK`. Le client est public côté
// admin (pas de clientSecret transmis).
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

  return validatePasswordOnlyShared({
    realm: process.env.KEYCLOAK_ADMIN_REALM_REVA as string,
    clientId,
    userId,
    password,
  });
};

// Mappe un `ClientApp` admin vers le clientId Keycloak concret. Exposé pour
// permettre aux features admin d'encoder le clientId dans le challenge OTP
// (le payload partagé porte realm + clientId, pas un enum applicatif).
export const getAdminClientIdFor = (clientApp: ClientApp): string => {
  if (clientApp === "REVA_ADMIN") {
    return process.env.KEYCLOAK_ADMIN_CLIENTID_REVA as string;
  }
  if (clientApp === "REVA_VAE_COLLECTIVE") {
    return process.env.KEYCLOAK_ADMIN_CLIENTID_REVA_VAE_COLLECTIVE as string;
  }
  return "";
};

// Wrapper admin: mappe `clientApp` (REVA_ADMIN | REVA_VAE_COLLECTIVE) vers le
// clientId concret, puis délègue au helper partagé. `reva-admin` et
// `reva-vae-collective` sont confidentiels: on transmet le client secret.
export const generateIAMTokenWithPassword = async (
  userId: string,
  password: string,
  clientApp: ClientApp,
  totp?: string,
) => {
  return generateIAMTokenWithPasswordShared({
    realm: process.env.KEYCLOAK_ADMIN_REALM_REVA as string,
    clientId: getAdminClientIdFor(clientApp),
    clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET as string,
    userId,
    password,
    totp,
  });
};
