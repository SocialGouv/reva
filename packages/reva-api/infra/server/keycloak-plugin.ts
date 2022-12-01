import { userInfo } from "os";

import KcAdminClient from "@keycloak/keycloak-admin-client";
import fp from "fastify-plugin";
import Keycloak from "keycloak-connect";

const hasRole = (roles: string[]) => (role: string) => roles.includes(role);

async function keycloakPlugin(app: any, opts: any, next: any) {
  const {
    config,
    middleware = {
      admin: "/",
      logout: "/logout",
    },
    ...prototypes
  } = opts;

  if (!prototypes.accessDenied) {
    prototypes.accessDenied = (request: any) => {
      request.log.error(`Access to ${request.url} denied.`);
      const err = new Error("Access Denied");
      // eslint-disable-next-line
      // @ts-ignore
      err.status = 403;
      throw err;
    };
  }

  Keycloak.prototype["accessDenied"] = prototypes["accessDenied"];

  const keycloak = new Keycloak(
    {},
    // eslint-disable-next-line
    //@ts-ignore
    config
  );

  app.addHook("onRequest", async (req: any, res: any) => {
    if (req.headers.authorization) {
      // eslint-disable-next-line no-unsafe-optional-chaining
      const [, token] = req.headers.authorization.split("Bearer ");
      if (token) {
        try {
          const userInfo = (await keycloak.grantManager.userInfo(token)) as any;
          req.auth = {
            hasRole: (role: string) => {
              return userInfo?.realm_access?.roles.includes(role);
            },
            token,
            userInfo,
          };
        } catch (e) {
          console.log(e);
        }
      }
    }
    req.auth = req.auth || { hasRole: () => false };
  });

  next();
}

export default fp(keycloakPlugin);
