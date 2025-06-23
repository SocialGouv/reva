import Fastify from "fastify";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import routesApiV1 from "./routes/v1/index.js";

dotenv.config({ path: "./.env" });

const fastify = Fastify({
  logger: true,
  ajv: {
    customOptions: {
      strict: false,
    },
  },
}).withTypeProvider<JsonSchemaToTsProvider>();

await fastify.register(routesApiV1, {
  prefix: "/interop/v1",
});

if (process.env.CORS_ORIGIN) {
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN.split(","),
  });
} else {
  await fastify.register(cors, {
    origin: true,
  });
}

try {
  await fastify.ready();
  await fastify.listen({
    port: (process.env.PORT || 8080) as number,
    host: "0.0.0.0",
  });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}

export const options = {
  ajv: {
    customOptions: {
      strict: false,
    },
  },
};
