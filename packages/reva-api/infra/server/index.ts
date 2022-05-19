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
import mercurius from "mercurius";
import cors from "fastify-cors";
import proxy from "fastify-http-proxy";
import fastifyStatic from "fastify-static";
import { graphqlConfiguration } from "../graphql";

const server = fastify({ logger: true });
const WEBSITE_ROUTE_PATH = "/";
const APP_ROUTE_PATH = "/app";

if (process.env.NODE_ENV === "production") {

  const DIST_FOLDER = path.join(__dirname, "..", "..");
  const APP_FOLDER = path.join(DIST_FOLDER, "app");
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
    });
  }

  server.register(fastifyStatic, {
    root: APP_FOLDER,
    prefix: APP_ROUTE_PATH,
    decorateReply: false,
  });

  // Deal with not found
  server.setNotFoundHandler((req, res) => {
    if (req.url.startsWith(APP_ROUTE_PATH)) {
      res.sendFile("index.html", APP_FOLDER);
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
  server.register(cors, { 
    origin: true// put your options here
  });
}


// Start GRAPHQL server
server.register(mercurius, graphqlConfiguration as any);

server.get("/ping", async (request, reply) => {
  return "pong";
});

server.listen(process.env.PORT || 8080, "0.0.0.0", (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address} in ${process.env.NODE_ENV}`);
});
