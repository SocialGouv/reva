import crypto from "crypto";

import { ajvFilePlugin } from "@fastify/multipart";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import Fastify from "fastify";

import routesApiV1 from "./routes/v1/index.js";

// Construit l'app Fastify (routes + garde proxy-secret) sans écouter de port.
// Point d'injection unique pour les tests smoke qui utilisent fastify.inject().
// dotenv reste dans index.ts uniquement : les tests chargent l'env via vitest.setup.ts.
export async function buildApp() {
  const datadogApiKey = process.env.DATADOG_API_KEY;
  const isTestEnv = process.env.NODE_ENV === "test";

  const fastify = Fastify({
    trustProxy: process.env.TRUSTED_PROXIES || false,
    logger: {
      serializers: {
        req(req) {
          return {
            host: req.host,
            remoteAddress: req.ip,
            remotePort: req.port || undefined,
            url: req.url,
            method: req.method,
            keycloakId: req.keycloakId,
          };
        },
        res(reply) {
          return {
            statusCode: reply.statusCode,
            keycloakId: reply.keycloakId,
            url: reply.request?.url,
            method: reply.request?.method,
            host: reply.request?.host,
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

  return fastify;
}
