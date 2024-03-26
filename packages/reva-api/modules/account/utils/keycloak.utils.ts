import { logger } from "../../shared/logger";

const baseUrl = process.env.BASE_URL || "https://vae.gouv.fr";
// const domain = "reva.incubateur.net"; // || "vae.gouv.fr";
const domain = "incubateur.net"; // || "vae.gouv.fr";

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
  console.log("data.redirect", data?.redirect);

  if (data) {
    return {
      headers: data.headers,
      redirect: `${baseUrl}/admin/candidacies`,
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
    return {
      headers: data.headers,
      redirect: `${baseUrl}/app`,
    };
  }

  return undefined;
};

export const impersonate = async (
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

    for (const header of response.headers) {
      if (header[0] == "set-cookie") {
        const key = "set-cookie";
        const value = `${cleanCookieValue(header[1])}; Domain=${domain};`;
        const cleanedHeader: [string, string] = [
          key,
          value,
          // header[1]
          // .replace("SameSite=None;", "")
          // .replace("Secure;", "")
          // .replace("Secure", "")
          // .replace("Path=/realms/reva/; ", `Domain=${domain};`)
          // .replace("Path=/auth/realms/reva/; ", `Domain=${domain};`)
          // .replace("Path=/realms/reva/", `Domain=${domain};`)
          // .replace("Path=/auth/realms/reva/", `Domain=${domain};`)
          // .replace("HttpOnly", ""),
        ];
        headers.push(cleanedHeader);
      }
    }

    console.log(headers);

    return { headers, redirect };
  } catch (error) {
    console.error(error);

    logger.error(error);
  }

  return undefined;
};

const cleanCookieValue = (value: string) => {
  return (
    value
      .replace("SameSite=None;", "")
      .replace("Secure;", "Secure")
      .replace("Secure ", "Secure")
      // .replace("Path=/realms/reva/; ", ``)
      // .replace("Path=/auth/realms/reva/; ", ``)
      // .replace("Path=/realms/reva/", ``)
      // .replace("Path=/auth/realms/reva/", ``)
      .replace("HttpOnly", "")
  );
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
