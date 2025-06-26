export const getUserAccessToken = async (params: {
  keycloakId: string;
}): Promise<string | undefined> => {
  try {
    const {
      KEYCLOAK_ADMIN_URL,
      KEYCLOAK_REVA_ADMIN_REALM,
      KEYCLOAK_REVA_ADMIN_IMPERSONATE_CLIENT_ID,
      KEYCLOAK_REVA_ADMIN_IMPERSONATE_CLIENT_SECRET,
    } = process.env;

    if (!KEYCLOAK_ADMIN_URL) {
      throw new Error('"KEYCLOAK_ADMIN_URL" env var is missing');
    }

    if (!KEYCLOAK_REVA_ADMIN_REALM) {
      throw new Error('"KEYCLOAK_REVA_ADMIN_REALM" env var is missing');
    }

    if (!KEYCLOAK_REVA_ADMIN_IMPERSONATE_CLIENT_ID) {
      throw new Error(
        '"KEYCLOAK_REVA_ADMIN_IMPERSONATE_CLIENT_ID" env var is missing',
      );
    }

    if (!KEYCLOAK_REVA_ADMIN_IMPERSONATE_CLIENT_SECRET) {
      throw new Error(
        '"KEYCLOAK_REVA_ADMIN_IMPERSONATE_CLIENT_SECRET" env var is missing',
      );
    }

    const { keycloakId } = params;

    const response = await fetch(
      `${KEYCLOAK_ADMIN_URL}/realms/${KEYCLOAK_REVA_ADMIN_REALM}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: KEYCLOAK_REVA_ADMIN_IMPERSONATE_CLIENT_ID,
          client_secret: KEYCLOAK_REVA_ADMIN_IMPERSONATE_CLIENT_SECRET,
          requested_subject: keycloakId,
          grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
          scope: "openid email profile",
        }),
      },
    );

    const { access_token } = (await response.json()) as any;
    if (access_token) {
      return access_token;
    }
  } catch (error) {
    console.error(error);
  }

  return undefined;
};
