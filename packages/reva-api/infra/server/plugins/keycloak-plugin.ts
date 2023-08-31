import { FastifyPluginAsync, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import jwt from "jsonwebtoken";
import Keycloak, { KeycloakConfig } from "keycloak-connect";

import { logger } from "../../../modules/shared/logger";

declare module "fastify" {
  interface FastifyRequest {
    auth: {
      hasRole: (role: KeyCloakUserRole) => boolean;
      userInfo: KeycloakConnectUserInfo;
      token: string;
    };
  }
}

interface KeycloakConnectUserInfo {
  realm_access?: {
    roles: KeyCloakUserRole[];
  };
  sub: string;
}

type KeycloakPluginOptions = {
  config: KeycloakConfig & { clientId: string };
  [x: string]: unknown;
};

const keycloakPlugin: FastifyPluginAsync<KeycloakPluginOptions> = async (
  app,
  opts
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

  const keycloak = new Keycloak({}, config);

  app.addHook("onRequest", async (req: FastifyRequest, _res: any) => {
    if (req.headers.authorization) {
      const [, token] = req.headers.authorization.split("Bearer ");

      if (token) {
        const decodedToken = jwt.decode(token) as { azp?: string };
        if (decodedToken?.azp === config.clientId) {
          //check if request should be handled by plugin instance(we have multiple realms and so multiple plugin instances)
          try {
            const userInfo = await keycloak.grantManager.userInfo<
              string,
              KeycloakConnectUserInfo
            >(token);
            req.auth = {
              hasRole: (role: KeyCloakUserRole) => {
                return (
                  userInfo?.realm_access?.roles as KeyCloakUserRole[]
                ).includes(role);
              },
              token,
              userInfo,
            };
          } catch (e) {
            logger.error(e);
          }
        }
      }
    }
    req.auth = req.auth || { hasRole: () => false };
  });
};

export default fp(keycloakPlugin);
