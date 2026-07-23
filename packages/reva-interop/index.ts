import { CrispStatusReporter } from "crisp-status-reporter";
import dotenv from "dotenv";

import { buildApp } from "./app.js";

dotenv.config({ path: "./.env" });

const fastify = await buildApp();

try {
  await fastify.ready();
  await fastify.listen({
    port: (process.env.PORT || 8080) as number,
    host: "0.0.0.0",
  });
  if (
    process.env.CRISP_TOKEN &&
    process.env.CRISP_SERVICE_ID &&
    process.env.CRISP_NODE_ID
  ) {
    new CrispStatusReporter({
      token: process.env.CRISP_TOKEN,
      service_id: process.env.CRISP_SERVICE_ID,
      node_id: process.env.CRISP_NODE_ID,
      replica_id: "1",
      interval: 30,
    });
  }
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
