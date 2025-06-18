import Fastify from "fastify";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
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
  prefix: "/v1",
});

try {
  await fastify.ready();
  await fastify.listen({ port: 3005 });
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
