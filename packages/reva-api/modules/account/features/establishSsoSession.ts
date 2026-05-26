import jwt from "jsonwebtoken";

import { logger } from "@/modules/shared/logger/logger";

import { impersonate } from "../utils/keycloak.utils";

type DecodedAdminToken = {
  sub?: string;
  resource_access?: Record<string, { roles?: string[] }>;
};

// Self-impersonate Keycloak pour qu'un admin loggué via password grant ait
// la session KEYCLOAK_IDENTITY posée sur le domaine Keycloak (nécessaire au
// silent check-sso cross-app). Fail-soft : toute erreur renvoie [].
export const establishSsoSession = async ({
  postLoginTokensCookie,
}: {
  postLoginTokensCookie: string | undefined;
}): Promise<string[]> => {
  if (!postLoginTokensCookie) return [];

  try {
    const { accessToken } = JSON.parse(postLoginTokensCookie) as {
      accessToken?: string;
    };
    if (!accessToken) return [];

    const decoded = jwt.decode(accessToken) as DecodedAdminToken | null;
    if (!decoded?.sub) return [];

    // Rejette les tokens d'autres clients (vae-collective, etc.) : seul le
    // login reva-admin établit la session Keycloak SSO.
    const adminClientId =
      process.env.KEYCLOAK_ADMIN_CLIENTID_REVA || "reva-admin";
    const roles = decoded.resource_access?.[adminClientId]?.roles;
    if (!roles?.includes("admin")) return [];

    const result = await impersonate(
      decoded.sub,
      process.env.KEYCLOAK_ADMIN_REALM_REVA as string,
    );
    if (!result) {
      logger.warn(
        "establishSsoSession: impersonate a échoué pour un admin, vérifier le service account Keycloak",
      );
      return [];
    }

    // Filtre défensif : si impersonate() venait à pousser d'autres headers,
    // on ne les forwarderait pas comme Set-Cookie.
    return result.headers
      .filter((h) => h[0].toLowerCase() === "set-cookie")
      .map((h) => h[1]);
  } catch (error) {
    logger.error(error);
    return [];
  }
};
