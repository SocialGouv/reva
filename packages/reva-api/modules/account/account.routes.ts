import { FastifyPluginAsync, FastifyReply } from "fastify";

import {
  BACKEND_BASE_URL,
  CANDIDATE_BASE_URL,
} from "@/modules/shared/config/config";
import { logger } from "@/modules/shared/logger/logger";

import { getFranceConnectAuthorizeRedirectUrl } from "./features/france-connect-authorize";
import {
  FranceConnectError,
  mapToOAuthError,
} from "./features/france-connect.errors";
import { handleFranceConnectCallback } from "./features/handleFranceConnectCallback";
import { impersonate } from "./features/impersonate";

const buildAuthErrorUrl = (error: unknown, state?: string): string => {
  const errorUrl = new URL(`${CANDIDATE_BASE_URL}/auth-error`);
  if (state) {
    errorUrl.searchParams.set("state", state);
  }
  const oauthError = mapToOAuthError(error);
  errorUrl.searchParams.set("error", oauthError.code);
  errorUrl.searchParams.set("error_description", oauthError.description);
  return errorUrl.toString();
};

const redirectToAuthError = (
  reply: FastifyReply,
  error: unknown,
  state?: string,
) => {
  return reply.redirect(buildAuthErrorUrl(error, state));
};

export const accountRoute: FastifyPluginAsync = async (server) => {
  server.get<{
    Querystring: { certificationId?: string; typeAccompagnement?: string };
  }>("/account/franceconnect/authorize", {
    schema: {
      querystring: {
        type: "object",
        properties: {
          certificationId: { type: "string" },
          typeAccompagnement: { type: "string" },
        },
      },
    },

    handler: async (request, reply) => {
      try {
        const { certificationId, typeAccompagnement } = request.query;
        const redirectUrl = await getFranceConnectAuthorizeRedirectUrl(
          reply,
          certificationId,
          typeAccompagnement,
        );
        return reply.redirect(redirectUrl);
      } catch (error) {
        logger.error(`[France Connect Authorize] ${error}`);
        return redirectToAuthError(reply, error);
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
      code?: string;
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
      },
    },
    handler: async (request, reply) => {
      try {
        const currentUrl = new URL(request.url, BACKEND_BASE_URL);
        const redirectUrl = await handleFranceConnectCallback(
          request,
          reply,
          currentUrl,
        );
        return reply.redirect(redirectUrl);
      } catch (error) {
        logger.error(`[France Connect Callback] ${error}`);

        if (error instanceof FranceConnectError && error.idToken) {
          const authErrorUrl = buildAuthErrorUrl(error, request.query.state);
          const keycloakLogoutUrl = new URL(
            `${process.env.KEYCLOAK_ADMIN_URL}/realms/${process.env.KEYCLOAK_APP_REALM}/protocol/openid-connect/logout`,
          );
          keycloakLogoutUrl.searchParams.set("id_token_hint", error.idToken);
          keycloakLogoutUrl.searchParams.set(
            "post_logout_redirect_uri",
            authErrorUrl,
          );
          return reply.redirect(keycloakLogoutUrl.toString());
        }

        return redirectToAuthError(reply, error, request.query.state);
      }
    },
  });
};
