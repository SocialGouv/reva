import { FastifyPluginAsync } from "fastify";

import { logger } from "@/modules/shared/logger/logger";

import { getFranceConnectAuthorizeRedirectUrl } from "./features/france-connect-authorize";
import { FranceConnectError } from "./features/france-connect.errors";
import { handleFranceConnectCallback } from "./features/handleFranceConnectCallback";
import { impersonate } from "./features/impersonate";

export const accountRoute: FastifyPluginAsync = async (server) => {
  server.get<{
    Querystring: { certificationId?: string };
  }>("/account/franceconnect/authorize", {
    schema: {
      querystring: {
        type: "object",
        properties: { certificationId: { type: "string" } },
      },
    },
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "1 minute",
      },
    },
    handler: async (request, reply) => {
      try {
        const { certificationId } = request.query;
        const redirectUrl = await getFranceConnectAuthorizeRedirectUrl(
          reply,
          certificationId,
        );
        return reply.redirect(redirectUrl);
      } catch (error) {
        logger.error(`[France Connect Authorize] ${error}`);
        const statusCode =
          error instanceof FranceConnectError ? error.statusCode : 500;
        return reply
          .status(statusCode)
          .send({ error: "France Connect authorization failed" });
      }
    },
  });

  server.get<{ Querystring: { token: string } }>("/account/impersonate", {
    schema: {
      querystring: {
        type: "object",
        properties: {
          token: { type: "string" },
        },
        required: ["token"],
      },
    },
    handler: async (request, reply) => {
      const { token } = request.query;

      const data = await impersonate(token);

      if (data) {
        const { headers, redirect } = data;

        for (const header of headers) {
          reply.header(header[0], header[1]);
        }

        return reply.redirect(redirect);
      }

      return reply.status(401).send();
    },
  });

  server.get<{
    Querystring: {
      code: string;
      session_state?: string;
      iss?: string;
      state?: string;
    };
  }>("/account/franceconnect/callback", {
    schema: {
      querystring: {
        type: "object",
        properties: {
          code: { type: "string" },
          session_state: { type: "string" },
          iss: { type: "string" },
          state: { type: "string" },
        },
        required: ["code"],
      },
    },
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "1 minute",
      },
    },
    handler: async (request, reply) => {
      try {
        const baseUrl =
          process.env.NODE_ENV !== "development"
            ? process.env.BASE_URL
            : "http://localhost:8080";

        const currentUrl = new URL(request.url, baseUrl);
        const redirectUrl = await handleFranceConnectCallback(
          request,
          reply,
          currentUrl,
        );
        return reply.redirect(redirectUrl);
      } catch (error) {
        logger.error(`[France Connect Callback] ${error}`);
        const statusCode =
          error instanceof FranceConnectError ? error.statusCode : 500;
        return reply
          .status(statusCode)
          .send({ error: "Authentication failed" });
      }
    },
  });
};
