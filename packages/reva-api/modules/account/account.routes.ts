import { FastifyPluginAsync } from "fastify";

import { logger } from "@/modules/shared/logger/logger";

import { getFranceConnectAuthorizeRedirectUrl } from "./features/france-connect-authorize";
import { getAndDeleteFcCode } from "./features/france-connect.utils";
import { handleFranceConnectCallback } from "./features/handleFranceConnectCallback";
import { impersonate } from "./features/impersonate";

export const accountRoute: FastifyPluginAsync = async (server) => {
  server.post<{
    Body: { code: string };
  }>("/account/franceconnect/tokens", {
    schema: {
      body: {
        type: "object",
        properties: { code: { type: "string" } },
        required: ["code"],
      },
    },
    handler: async (request, reply) => {
      const { code } = request.body;
      const tokens = getAndDeleteFcCode(code);
      if (!tokens) {
        return reply.status(401).send({ error: "Invalid or expired code" });
      }
      return reply.send({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        idToken: tokens.idToken,
      });
    },
  });

  server.get<{
    Querystring: { certificationId?: string };
  }>("/account/franceconnect/authorize", {
    schema: {
      querystring: {
        type: "object",
        properties: { certificationId: { type: "string" } },
      },
    },
    handler: async (request, reply) => {
      try {
        const { certificationId } = request.query;
        const redirectUrl =
          await getFranceConnectAuthorizeRedirectUrl(certificationId);
        return reply.redirect(redirectUrl);
      } catch (error) {
        logger.error(`[France Connect Authorize] ${error}`);
        return reply
          .status(400)
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
    handler: async (request, reply) => {
      try {
        const protocol =
          (request.headers["x-forwarded-proto"] as string)
            ?.split(",")[0]
            ?.trim() === "https"
            ? "https"
            : "http";
        const host =
          (request.headers["x-forwarded-host"] as string) ||
          request.headers.host ||
          "localhost:8080";
        const currentUrl = new URL(request.url, `${protocol}://${host}`);
        const redirectUrl = await handleFranceConnectCallback(currentUrl);
        return reply.redirect(redirectUrl);
      } catch (error) {
        logger.error(`[France Connect Callback] ${error}`);
        return reply.status(401).send({ error: "Authentication failed" });
      }
    },
  });
};
