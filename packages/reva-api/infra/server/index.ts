import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), "..", "..", ".env") });


import fastify from "fastify";
import mercurius from "mercurius";
import cors from "fastify-cors";
import proxy from "fastify-http-proxy";
import fastifyStatic from "fastify-static";
import { graphqlConfiguration } from "../graphql";
import { deleteCandidacyFromEmail, deleteCandidacyFromPhone } from "../database/postgres/candidacies";

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

server.post("/admin/candidacies/delete", async (request, reply) => {
  console.log(request.headers)
  if (!process.env.ADMIN_TOKEN || request.headers['admin_token'] !== process.env.ADMIN_TOKEN) {
    return reply.status(403).send("Not authorized");
  }

  const {email, phone} = request.query as any

  console.log({email, phone})

  if (email) {
    await deleteCandidacyFromEmail(email)
  }
  if (phone) {
    await deleteCandidacyFromPhone(phone)
  }
  reply.send("deleted")
})

server.listen(process.env.PORT || 8080, "0.0.0.0", (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address} in ${process.env.NODE_ENV}`);
});
