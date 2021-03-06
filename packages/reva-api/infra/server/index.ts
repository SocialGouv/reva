import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), "..", "..", ".env") });

// const apm = require("elastic-apm-node").start({
//   // Override the service name from package.json
//   // Allowed characters: a-z, A-Z, 0-9, -, _, and space
//   serviceName: `reva-api`,

//   // Use if APM Server requires a secret token
//   secretToken: process.env.ES_APM_SERVER_TOKEN || "",

//   // Set the custom APM Server URL (default: http://localhost:8200)
//   serverUrl: process.env.ES_APM_SERVER_URL || "http://localhost:8200",

//   // Set the service environment
//   environment: process.env.APP_ENV || "dev",
// });

import fastify from "fastify";
import mercurius, { MercuriusOptions } from "mercurius";
import cors from "@fastify/cors";
import proxy from "@fastify/http-proxy";
import fastifyStatic from "@fastify/static";
import keycloakPlugin from "./keycloak-plugin";

import { graphqlConfiguration } from "../graphql";
import { deleteCandidacyFromEmail, deleteCandidacyFromPhone } from "../database/postgres/candidacies";

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
    decorateReply: process.env.FRAMER_WEBSITE_URL,
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
    origin: (process.env.CORS_ORIGIN || "").split(",") // put your options here
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
    origin: true// put your options here
  });
}


server.register(keycloakPlugin, {
  config: {
    clientId: process.env.KEYCLOAK_CLIENT_ID || "reva-app",
    bearerOnly: true,
    serverUrl: process.env.KEYCLOAK_SERVER_URL || "http://localhost:8888/auth/",
    realm: process.env.KEYCLOAK_REALM || "REVA",
    realmPublicKey:
      process.env.KEYCLOAK_REALM_PUBLIC_KEY || "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqhxnYgR26sDfdfOGA26gIlg5of7wcxs9mEtWttQ6jGhlQLU97SjLa5T9918UPa/7a73ye/7rGyE71BxYham851xzjAQ0aEvWKK+0scVgH3KXtLz7yA5VzI8ToXNqqvbHwOkllwXrcA+dVxIDHTDJXPhEwix02uPSBsQ6Cskn6hN4WASj4Eul4fOZReJiKCUf5luGWV7MtQHof4S3FZACE4UqfwbflXWiSBoT13+GOiNszj5OAf0WrXNUvNAqQM8AnE4MbKOwa04UbUmOmU0G8Fm3f3S1887pyEkoxQttw0RKX0kAsnYF9VganmO00dc6TJAl4PWa0Ev3z/TiWoDmcwIDAQAB"
  }
});

// Start GRAPHQL server
server.register(mercurius, graphqlConfiguration as MercuriusOptions);

server.get("/ping", async function (request, reply) {
  // const userInfo = await this.keycloak.grantManager.userInfo(request.headers.authorization?.split('Bearer ')[1]);
  // console.log("userInfo", userInfo);
  reply.send("pong");
});

server.post("/admin/candidacies/delete", async (request, reply) => {
  if (!process.env.ADMIN_TOKEN || request.headers['admin_token'] !== process.env.ADMIN_TOKEN) {
    return reply.status(403).send("Not authorized");
  }

  const { email, phone } = request.query as any;

  console.log({ email, phone });

  if (email) {
    await deleteCandidacyFromEmail(email);
  }
  if (phone) {
    await deleteCandidacyFromPhone(phone);
  }
  reply.send("deleted");
});

const start = async () => {
  try {
    await server.listen({ 
      port: (process.env.PORT || 8080) as number, 
      host: "0.0.0.0"
    });
    console.log(`Server listening on ${process.env.PORT} in ${process.env.NODE_ENV}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
