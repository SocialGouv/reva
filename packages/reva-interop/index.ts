import crypto from "crypto";

import { ajvFilePlugin } from "@fastify/multipart";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { CrispStatusReporter } from "crisp-status-reporter";
import dotenv from "dotenv";
import Fastify from "fastify";

import routesApiV1 from "./routes/v1/index.js";

dotenv.config({ path: "./.env" });

const datadogApiKey = process.env.DATADOG_API_KEY;
const isTestEnv = process.env.NODE_ENV === "test";

const fastify = Fastify({
  trustProxy: process.env.TRUSTED_PROXIES || false,
  logger: {
    serializers: {
      res(reply) {
        return {
          statusCode: reply.statusCode,
          keycloakId: reply.keycloakId,
        };
      },
    },
    transport: datadogApiKey
      ? {
          level: isTestEnv ? "silent" : "info",
          targets: [
            {
              target: "pino-datadog-transport",
              level: "info",
              options: {
                ddClientConf: {
                  authMethods: {
                    apiKeyAuth: datadogApiKey,
                  },
                },
                ddServerConf: { site: "datadoghq.eu" },
              },
            },
            { target: "pino/file", level: "info", options: {} },
          ],
        }
      : undefined,
  },
  ajv: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: [ajvFilePlugin as unknown as any],
    customOptions: {
      strict: false,
    },
  },
}).withTypeProvider<JsonSchemaToTsProvider>();

await fastify.register(routesApiV1, {
  prefix: "/interop/v1",
});

fastify.addHook("onRequest", (request, reply, done) => {
  const secret = request.headers["x-interop-secret"] || "";
  const proxySecret = process.env.INTEROP_PROXY_SECRET || "";
  const lengthsMatch = secret.length === proxySecret.length;

  // Do not return early when lengths differ — that leaks the secret's
  // length through timing.  Instead, always perform a constant-time
  // comparison: when the lengths match compare directly; otherwise
  // compare the user input against itself (always true) and negate.
  const isEqual = lengthsMatch
    ? crypto.timingSafeEqual(
        Buffer.from(secret as string),
        Buffer.from(proxySecret as string),
      )
    : !crypto.timingSafeEqual(
        Buffer.from(secret as string),
        Buffer.from(secret as string),
      );

  if (!isEqual) {
    reply.status(403).send();
  } else {
    done();
  }
});

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
