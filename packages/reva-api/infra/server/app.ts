import path from "path";

import cors from "@fastify/cors";
import proxy from "@fastify/http-proxy";
import fastifyStatic from "@fastify/static";

import fastify, {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
  FastifyServerOptions,
} from "fastify";

import { feasibilityFileUploadRoute } from "../../modules/feasibility/feasibility.routes";
import { dossierDeValidationRoute } from "../../modules/dossier-de-validation/dossier-de-validation.routes";
import { juryRoute } from "../../modules/jury/jury.routes";
import paymentRequestFvaeFileUploadAndConfirmationRoute from "../../modules/finance/unifvae/finance.routes";
import proofUploadRoute from "../../modules/finance/unireva/finance.routes";
import { logger } from "../../modules/shared/logger";
import { mercuriusGraphQL } from "./mercurius";
import keycloakAdminPlugin from "./plugins/keycloak-admin-plugin";
import keycloakPlugin from "./plugins/keycloak-plugin";
import { setDefaultOptions } from "date-fns";
import { fr } from "date-fns/locale";

const APP_ROUTE_PATH = "/app";
const ADMIN_ROUTE_PATH = "/admin";
const ADMIN_REACT_ROUTE_PATH = "/admin2";

type BuilAppOptions = FastifyServerOptions & {
  keycloakPluginMock?: FastifyPluginAsync<FastifyPluginOptions>;
};

export const buildApp = async (
  opts: BuilAppOptions = {},
): Promise<FastifyInstance> => {
  //Date-fns default locale
  setDefaultOptions({ locale: fr });

  const app = await fastify(opts);

  if (process.env.NODE_ENV === "production") {
    const DIST_FOLDER = path.join(__dirname, "..", "..");
    const APP_FOLDER = path.join(DIST_FOLDER, "app");
    const ADMIN_FOLDER = path.join(DIST_FOLDER, "admin");

    app.register(fastifyStatic, {
      root: APP_FOLDER,
      prefix: APP_ROUTE_PATH,
      // decorateReply: false,
    });

    app.register(fastifyStatic, {
      root: ADMIN_FOLDER,
      prefix: ADMIN_ROUTE_PATH,
      decorateReply: false,
    });

    // Deal with not found
    app.setNotFoundHandler((req, res) => {
      if (req.url.startsWith(APP_ROUTE_PATH)) {
        res.sendFile("index.html", APP_FOLDER);
      } else if (req.url.startsWith(ADMIN_ROUTE_PATH)) {
        res.sendFile("index.html", ADMIN_FOLDER);
      }
    });

    app.register(cors, {
      origin: (process.env.CORS_ORIGIN || "").split(","),
    });
  } else {
    app.register(proxy, {
      upstream: "http://localhost:3001/app",
      prefix: APP_ROUTE_PATH,
    });

    app.register(proxy, {
      upstream: "http://localhost:3000/admin",
      prefix: ADMIN_ROUTE_PATH,
    });

    app.register(proxy, {
      upstream: "http://localhost:3003/admin2",
      prefix: ADMIN_REACT_ROUTE_PATH,
    });

    app.register(cors, {
      origin: true,
    });
  }

  if (opts.keycloakPluginMock) {
    app.register(opts.keycloakPluginMock);
  } else {
    app.register(keycloakPlugin, {
      config: {
        clientId: process.env.KEYCLOAK_ADMIN_CLIENTID_REVA || "reva-admin",
        "bearer-only": true,
        "auth-server-url":
          process.env.KEYCLOAK_ADMIN_URL || "http://localhost:8888/auth/",
        realm: process.env.KEYCLOAK_ADMIN_REALM_REVA || "reva",
        // realmPublicKey: process.env.KEYCLOAK_ADMIN_REALM_REVA_PUBLIC_KEY || "",
      } as any,
    });
  }

  app.register(keycloakPlugin, {
    config: {
      clientId: process.env.KEYCLOAK_APP_REVA_APP || "reva-app",
      "bearer-only": true,
      "auth-server-url":
        process.env.KEYCLOAK_ADMIN_URL || "http://localhost:8888/auth/",
      realm: process.env.KEYCLOAK_APP_REALM || "reva-app",
      // realmPublicKey: process.env.KEYCLOAK_APP_REALM_REVA_APP_PUBLIC_KEY || "",
    } as any,
  });

  app.register(keycloakAdminPlugin);

  app.register(mercuriusGraphQL, {
    prefix: "/api",
  });

  app.register(proofUploadRoute, {
    prefix: "/api",
  });

  app.register(paymentRequestFvaeFileUploadAndConfirmationRoute, {
    prefix: "/api",
  });

  app.register(feasibilityFileUploadRoute, { prefix: "/api" });
  app.register(dossierDeValidationRoute, { prefix: "/api" });
  app.register(juryRoute, { prefix: "/api" });

  logger.info("started");
  return app;
};
