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

import { restRoutes } from "../rest";
import proofUploadRoute from "../rest/proof-upload";
import { mercuriusGraphQL } from "./mercurius";
import keycloakAdminPlugin from "./plugins/keycloak-admin-plugin";
import keycloakPlugin from "./plugins/keycloak-plugin";

const WEBSITE_ROUTE_PATH = "/";
const APP_ROUTE_PATH = "/app";
const ADMIN_ROUTE_PATH = "/admin";

type BuilAppOptions = FastifyServerOptions & {
  keycloakPluginMock?: FastifyPluginAsync<FastifyPluginOptions>;
};

export const buildApp = async (
  opts: BuilAppOptions = {}
): Promise<FastifyInstance> => {
  const app = await fastify(opts);

  if (process.env.ES_APM_SERVER_URL) {
    const apm = require("elastic-apm-node").start({
      // Override the service name from package.json
      // Allowed characters: a-z, A-Z, 0-9, -, _, and space
      serviceName: `reva-api`,

      // Use if APM Server requires a secret token
      secretToken: process.env.ES_APM_SERVER_TOKEN || "",

      // Set the custom APM Server URL (default: http://localhost:8200)
      serverUrl: process.env.ES_APM_SERVER_URL,

      // Set the service environment
      environment: process.env.APP_ENV || "dev",
    });
  }

  if (process.env.NODE_ENV === "production") {
    const DIST_FOLDER = path.join(__dirname, "..", "..");
    const APP_FOLDER = path.join(DIST_FOLDER, "app");
    const ADMIN_FOLDER = path.join(DIST_FOLDER, "admin");
    const WEBSITE_FOLDER = path.join(DIST_FOLDER, "website");

    if (process.env.FRAMER_WEBSITE_URL) {
      app.register(proxy, {
        upstream: process.env.FRAMER_WEBSITE_URL,
        prefix: WEBSITE_ROUTE_PATH,
      });
    } else {
      app.register(fastifyStatic, {
        root: WEBSITE_FOLDER,
        prefix: WEBSITE_ROUTE_PATH,
        decorateReply: true,
      });
    }

    app.register(fastifyStatic, {
      root: APP_FOLDER,
      prefix: APP_ROUTE_PATH,
      decorateReply: process.env.FRAMER_WEBSITE_URL,
    });

    app.register(fastifyStatic, {
      root: ADMIN_FOLDER,
      prefix: ADMIN_ROUTE_PATH,
      decorateReply: false,
    });

    // Deal with not found
    app.setNotFoundHandler((req, res) => {
      if (req.url.startsWith(APP_ROUTE_PATH)) {
        // eslint-disable-next-line
        //@ts-ignore
        res.sendFile("index.html", APP_FOLDER);
      } else if (req.url.startsWith(ADMIN_ROUTE_PATH)) {
        // eslint-disable-next-line
        //@ts-ignore
        res.sendFile("index.html", ADMIN_FOLDER);
      } else {
        res.redirect(process.env.FRAMER_WEBSITE_URL || "/");
      }
    });

    app.register(cors, {
      origin: (process.env.CORS_ORIGIN || "").split(","),
    });
  } else {
    app.register(proxy, {
      upstream: process.env.FRAMER_WEBSITE_URL || "http://localhost:3000",
      prefix: WEBSITE_ROUTE_PATH,
    });

    app.register(proxy, {
      upstream: "http://localhost:3001/app",
      prefix: APP_ROUTE_PATH,
    });

    app.register(proxy, {
      upstream: "http://localhost:3000/admin",
      prefix: ADMIN_ROUTE_PATH,
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
        bearerOnly: true,
        serverUrl:
          process.env.KEYCLOAK_ADMIN_URL || "http://localhost:8888/auth/",
        realm: process.env.KEYCLOAK_ADMIN_REALM_REVA || "reva",
        realmPublicKey: process.env.KEYCLOAK_ADMIN_REALM_REVA_PUBLIC_KEY || "",
      },
    });
  }

  app.register(keycloakPlugin, {
    config: {
      clientId: process.env.KEYCLOAK_APP_REVA_APP || "reva-app",
      bearerOnly: true,
      serverUrl:
        process.env.KEYCLOAK_ADMIN_URL || "http://localhost:8888/auth/",
      realm: process.env.KEYCLOAK_APP_REALM || "reva-app",
      realmPublicKey: process.env.KEYCLOAK_APP_REALM_REVA_APP_PUBLIC_KEY || "",
    },
  });

  app.register(keycloakAdminPlugin);

  app.register(mercuriusGraphQL);

  app.register(restRoutes);

  app.register(proofUploadRoute);

  return app;
};
