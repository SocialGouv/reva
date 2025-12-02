import { FastifyPluginAsync } from "fastify";

import { logger } from "@/modules/shared/logger/logger";

import { impersonate } from "./features/impersonate";
import { unsafeHandleFranceConnectCallback } from "./features/unsafeHandleFranceConnectCallback";

export const accountRoute: FastifyPluginAsync = async (server) => {
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

        reply.redirect(redirect);

        return;
      }

      reply.status(401).send();
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
    handler: async (request, reply) => {
      const { code, state } = request.query;

      try {
        const redirectUrl = await unsafeHandleFranceConnectCallback(
          code,
          state,
        );
        reply.redirect(redirectUrl);
      } catch (error) {
        logger.error(`[France Connect Callback] ${error}`);
        reply.status(401).send({ error: "Authentication failed" });
      }
    },
  });
};
