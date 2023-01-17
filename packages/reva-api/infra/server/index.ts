import path from "path";

import cors from "@fastify/cors";
import proxy from "@fastify/http-proxy";
import fastifyStatic from "@fastify/static";
import dotenv from "dotenv";
import fastify, { FastifyReply, FastifyRequest } from "fastify";
import mercurius, { MercuriusOptions } from "mercurius";

import {
  deleteCandidacyFromEmail,
  deleteCandidacyFromPhone,
} from "../database/postgres/candidacies";
import { graphqlConfiguration } from "../graphql";
import { logger } from "../logger";
import keycloakAdminPlugin from "./plugins/keycloak-admin-plugin";
import keycloakPlugin from "./plugins/keycloak-plugin";
import proofUploadRoute from "./proof-upload";

dotenv.config({ path: path.join(process.cwd(), "..", "..", ".env") });

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

const server = fastify({ logger: true });
const WEBSITE_ROUTE_PATH = "/";
const APP_ROUTE_PATH = "/app";
const ADMIN_ROUTE_PATH = "/admin";

if (process.env.NODE_ENV === "production") {
  const DIST_FOLDER = path.join(__dirname, "..", "..");
  const APP_FOLDER = path.join(DIST_FOLDER, "app");
  const ADMIN_FOLDER = path.join(DIST_FOLDER, "admin");
  const WEBSITE_FOLDER = path.join(DIST_FOLDER, "website");

  if (process.env.FRAMER_WEBSITE_URL) {
    server.register(proxy, {
      upstream: process.env.FRAMER_WEBSITE_URL,
      prefix: WEBSITE_ROUTE_PATH,
    });
  } else {
    server.register(fastifyStatic, {
      root: WEBSITE_FOLDER,
      prefix: WEBSITE_ROUTE_PATH,
      decorateReply: true,
    });
  }

  server.register(fastifyStatic, {
    root: APP_FOLDER,
    prefix: APP_ROUTE_PATH,
    decorateReply: Boolean(process.env.FRAMER_WEBSITE_URL),
  });

  server.register(fastifyStatic, {
    root: ADMIN_FOLDER,
    prefix: ADMIN_ROUTE_PATH,
    decorateReply: false,
  });

  // Deal with not found
  server.setNotFoundHandler((req, res) => {
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

  server.register(cors, {
    origin: (process.env.CORS_ORIGIN || "").split(","), // put your options here
  });
} else {
  server.register(proxy, {
    upstream: process.env.FRAMER_WEBSITE_URL || "http://localhost:3000",
    prefix: WEBSITE_ROUTE_PATH,
  });

  server.register(proxy, {
    upstream: "http://localhost:3001/app",
    prefix: APP_ROUTE_PATH,
  });

  server.register(proxy, {
    upstream: "http://localhost:3000/admin",
    prefix: ADMIN_ROUTE_PATH,
  });

  server.register(cors, {
    origin: true, // put your options here
  });
}

server.register(keycloakPlugin, {
  config: {
    clientId: process.env.KEYCLOAK_ADMIN_CLIENTID_REVA || "reva-admin",
    bearerOnly: true,
    serverUrl: process.env.KEYCLOAK_ADMIN_URL || "http://localhost:8888/auth/",
    realm: process.env.KEYCLOAK_ADMIN_REALM_REVA || "reva",
    realmPublicKey: process.env.KEYCLOAK_ADMIN_REALM_REVA_PUBLIC_KEY || "",
  },
});

server.register(keycloakPlugin, {
  config: {
    clientId: process.env.KEYCLOAK_APP_REVA_APP || "reva-app",
    bearerOnly: true,
    serverUrl: process.env.KEYCLOAK_ADMIN_URL || "http://localhost:8888/auth/",
    realm: process.env.KEYCLOAK_APP_REALM || "reva-app",
    realmPublicKey: process.env.KEYCLOAK_APP_REALM_REVA_APP_PUBLIC_KEY || "",
  },
});

server.register(keycloakAdminPlugin);

// Start GRAPHQL server
const buildGqlContext = async (req: FastifyRequest, _reply: FastifyReply) => {
  return {
    auth: req.auth,
  };
};

type PromiseType<T> = T extends PromiseLike<infer U> ? U : T;

declare module "mercurius" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface MercuriusContext
    extends PromiseType<ReturnType<typeof buildGqlContext>> {}
}

server.register(mercurius, {
  ...graphqlConfiguration,
  context: buildGqlContext,
} as MercuriusOptions);

server.get("/ping", async function (_request, reply) {
  reply.send("pong");
});

server.post("/admin/candidacies/delete", async (request, reply) => {
  if (
    !process.env.ADMIN_TOKEN ||
    request.headers["admin_token"] !== process.env.ADMIN_TOKEN
  ) {
    return reply.status(403).send("Not authorized");
  }

  const { email, phone } = request.query as any;

  logger.info({ email, phone });

  if (email) {
    await deleteCandidacyFromEmail(email);
  }
  if (phone) {
    await deleteCandidacyFromPhone(phone);
  }
  reply.send("deleted");
});

server.register(proofUploadRoute);

const start = async () => {
  try {
    await server.listen({
      port: (process.env.PORT || 8080) as number,
      host: "0.0.0.0",
    });
    server.log.info(
      `Server listening on ${process.env.PORT} in ${process.env.NODE_ENV}`
    );
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
