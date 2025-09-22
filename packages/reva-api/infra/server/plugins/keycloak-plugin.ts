import { FastifyPluginAsync, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import jwt from "jsonwebtoken";
import Keycloak, { KeycloakConfig } from "keycloak-connect";

import { logger } from "@/modules/shared/logger/logger";

declare module "fastify" {
  interface FastifyRequest {
    auth: {
      hasRole: (role: KeyCloakUserRole) => boolean;
      userInfo: KeycloakConnectUserInfo;
      token: string;
    };
  }
}

// Without this rule disabled here, we would have a compilation error
// on buildGqlContext (infra/server/mercurius.ts)
// eslint-disable-next-line import/no-unused-modules
export interface KeycloakConnectUserInfo {
  realm_access?: {
    roles: KeyCloakUserRole[];
  };
  sub: string;
  email: string;
}

type KeycloakPluginOptions = {
  config: KeycloakConfig & { clientId: string };
  [x: string]: unknown;
};

const keycloakPlugin: FastifyPluginAsync<KeycloakPluginOptions> = async (
  app,
  opts,
): Promise<void> => {
  const { config, ...prototypes } = opts;

  if (!prototypes.accessDenied) {
    prototypes.accessDenied = (request: FastifyRequest) => {
      request.log.error(`Access to ${request.url} denied.`);
      const err = new Error("Access Denied");
      // eslint-disable-next-line
      // @ts-ignore
      err.status = 403;
      throw err;
    };
  }

  Keycloak.prototype["accessDenied"] = prototypes["accessDenied"];

  app.addHook("onRequest", async (req: FastifyRequest, _res: any) => {
    if (req.headers.authorization) {
      const validateAuthToken = process.env.NODE_ENV !== "test";
      const [, token] = req.headers.authorization.split("Bearer ");
      if (validateAuthToken && !token) {
        throw new Error("bearer token invalide");
      }

      const decodedToken = jwt.decode(token) as { azp?: string };
      if (validateAuthToken && !decodedToken) {
        throw new Error("JWT invalide");
      }

      if (decodedToken?.azp === config.clientId) {
        // check if request should be handled by plugin instance(we have multiple realms and so multiple plugin instances)
        try {
          const keycloak = new Keycloak({}, config);
          const userInfo = await keycloak.grantManager.userInfo<
            string,
            KeycloakConnectUserInfo
          >(token);

          req.auth = {
            hasRole: (role: KeyCloakUserRole) => {
              return (
                userInfo?.realm_access?.roles as KeyCloakUserRole[]
              )?.includes(role);
            },
            token,
            userInfo,
          };
        } catch (e) {
          logger.error(e);
        }
      } else if (
        decodedToken?.azp ===
        process.env.KEYCLOAK_REVA_ADMIN_IMPERSONATE_CLIENT_ID
      ) {
        //check if request should be handled by plugin instance(we have multiple realms and so multiple plugin instances)
        try {
          const keycloak = new Keycloak({}, {
            "auth-server-url":
              process.env.KEYCLOAK_ADMIN_URL || "http://localhost:8888/auth/",
            realm: process.env.KEYCLOAK_ADMIN_REALM_REVA || "reva",
          } as any);

          const userInfo = await keycloak.grantManager.userInfo<
            string,
            KeycloakConnectUserInfo
          >(token);

          req.auth = {
            hasRole: (role: KeyCloakUserRole) => {
              return (
                userInfo?.realm_access?.roles as KeyCloakUserRole[]
              )?.includes(role);
            },
            token,
            userInfo,
          };
        } catch (e) {
          logger.error(e);
        }
      }
    }
    req.auth = req.auth || { hasRole: () => false };
  });
};

export default fp(keycloakPlugin);
