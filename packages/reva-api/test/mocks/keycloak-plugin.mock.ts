import { FastifyPluginAsync, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

interface KeycloakConnectUserInfo {
  realm_access?: {
    roles: KeyCloakUserRole[];
  };
  sub: string;
}

const keycloakPluginMock: FastifyPluginAsync = async (
  app,
  _opts
): Promise<void> => {
  app.addHook("onRequest", async (req: FastifyRequest, _res: any) => {
    if (req.headers.authorization) {
      const [role, sub] = req.headers.authorization.split("/");
      let userInfo: KeycloakConnectUserInfo;
      switch (role as KeyCloakUserRole) {
        case "admin":
          userInfo = {
            sub,
            realm_access: {
              roles: ["admin", "manage_candidacy"],
            },
          };
          break;
        case "manage_candidacy":
          userInfo = {
            sub,
            realm_access: {
              roles: ["manage_candidacy"],
            },
          };
          break;
        case "manage_feasibility":
          userInfo = {
            sub,
            realm_access: {
              roles: ["manage_feasibility"],
            },
          };
          break;
        case "candidate":
          userInfo = {
            sub,
            realm_access: {
              roles: [],
            },
          };
          break;
        case "gestion_maison_mere_aap":
          userInfo = {
            sub,
            realm_access: {
              roles: ["manage_candidacy", "gestion_maison_mere_aap"],
            },
          };
          break;
      }
      req.auth = {
        hasRole: (role: KeyCloakUserRole) => {
          return (userInfo?.realm_access?.roles as KeyCloakUserRole[]).includes(
            role
          );
        },
        token: req.headers.authorization,
        userInfo,
      };
    }
    req.auth = req.auth || { hasRole: () => false };
  });
};

export default fp(keycloakPluginMock);
