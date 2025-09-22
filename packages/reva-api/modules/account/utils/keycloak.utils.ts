import Keycloak from "keycloak-connect";

import { getKeycloakAdmin } from "@/modules/shared/auth/getKeycloakAdmin";
import { logger } from "@/modules/shared/logger/logger";

import { ClientApp } from "../account.type";

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
    const baseUrl = process.env.BASE_URL || "https://vae.gouv.fr";

    return {
      headers: data.headers,
      redirect: `${baseUrl}/admin2`,
    };
  }

  return undefined;
};

export const impersonateCandiate = async (
  keycloakId: string,
): Promise<
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
    const baseUrl = process.env.BASE_URL || "https://vae.gouv.fr";

    return {
      headers: data.headers,
      redirect: `${baseUrl}/candidat`,
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

    const headers = [];

    const domain = process.env.FRANCE_VAE_DOMAIN || "gouv.fr";

    for (const header of response.headers) {
      if (
        header[0] == "set-cookie" &&
        header[1].indexOf("KEYCLOAK_IDENTITY") != -1
      ) {
        const key = "set-cookie";
        const value = `${cleanCookieValue(header[1])} Domain=${domain};`;
        const cleanedHeader: [string, string] = [key, value];
        headers.push(cleanedHeader);
      }
    }

    return { headers, redirect };
  } catch (error) {
    console.error(error);

    logger.error(error);
  }

  return undefined;
};

const cleanCookieValue = (value: string) => {
  return value
    .replace("SameSite=None", "")
    .replace("Secure", ";")
    .replace("HttpOnly", "")
    .replace(";;;", "")
    .replace(";;", "");
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

export const generateIAMTokenWithPassword = async (
  userId: string,
  password: string,
  clientApp: ClientApp,
) => {
  const keycloakAdmin = await getKeycloakAdmin();

  const user = await keycloakAdmin.users.findOne({
    id: userId,
    realm: process.env.KEYCLOAK_ADMIN_REALM_REVA as string,
  });

  if (!user) {
    throw new Error(`userId ${userId} not found`);
  }

  try {
    let clientId = "";
    if (clientApp === "REVA_ADMIN") {
      clientId = process.env.KEYCLOAK_ADMIN_CLIENTID_REVA as string;
    } else if (clientApp === "REVA_VAE_COLLECTIVE") {
      clientId = process.env
        .KEYCLOAK_ADMIN_CLIENTID_REVA_VAE_COLLECTIVE as string;
    }

    //generate a token for the user
    const _keycloak = new Keycloak(
      {},
      {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        clientId,
        serverUrl: process.env.KEYCLOAK_ADMIN_URL as string,
        realm: process.env.KEYCLOAK_ADMIN_REALM_REVA as string,
        credentials: {
          secret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET,
        },
      },
    );

    const grant = await _keycloak.grantManager.obtainDirectly(
      user.username as string,
      password,
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const refreshToken = grant?.refresh_token?.token;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accessToken = grant?.access_token?.token;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const idToken = grant?.id_token?.token;
    return { accessToken, refreshToken, idToken };
  } catch (e) {
    logger.error(e);
    throw new Error(`Erreur lors de la génération du token IAM`);
  }
};
