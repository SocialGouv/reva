import { FastifyPluginAsync, FastifyReply } from "fastify";

import {
  BACKEND_BASE_URL,
  CANDIDATE_BASE_URL,
} from "@/modules/shared/config/config";
import { logger } from "@/modules/shared/logger/logger";

import { establishSsoSession } from "./features/establishSsoSession";
import { getFranceConnectAuthorizeRedirectUrl } from "./features/france-connect-authorize";
import {
  FranceConnectError,
  mapToOAuthError,
} from "./features/france-connect.errors";
import { handleFranceConnectCallback } from "./features/handleFranceConnectCallback";
import { impersonate } from "./features/impersonate";

const POST_LOGIN_TOKENS_COOKIE = "post_login_tokens";
const DEFAULT_ESTABLISH_SSO_REDIRECT = "/admin2/post-login";

// Anti-open-redirect : parse pour neutraliser ../, %2F, scheme absolu, etc.
const isSafeAdminRedirect = (next: string): boolean => {
  try {
    const url = new URL(next, "http://placeholder.local");
    return (
      url.origin === "http://placeholder.local" &&
      url.pathname.startsWith("/admin2/")
    );
  } catch {
    return false;
  }
};

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

        // Fastify : reply.header("set-cookie", val) ecrase la valeur
        // precedente si rappele. Pour poser plusieurs Set-Cookie il faut
        // passer un array en un seul appel.
        const setCookies: string[] = [];
        for (const header of headers) {
          if (header[0].toLowerCase() === "set-cookie") {
            setCookies.push(header[1]);
          } else {
            reply.header(header[0], header[1]);
          }
        }
        if (setCookies.length > 0) {
          reply.header("set-cookie", setCookies);
        }

        return reply.redirect(redirect);
      }

      return reply.status(401).send();
    },
  });

  server.get<{ Querystring: { next?: string } }>("/account/establish-sso", {
    schema: {
      querystring: {
        type: "object",
        properties: {
          next: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      const next =
        request.query.next && isSafeAdminRedirect(request.query.next)
          ? request.query.next
          : DEFAULT_ESTABLISH_SSO_REDIRECT;

      const setCookies = await establishSsoSession({
        postLoginTokensCookie: request.cookies?.[POST_LOGIN_TOKENS_COOKIE],
      });

      // reply.header("set-cookie", value) écrase ; pour multi-cookies passer un array.
      if (setCookies.length > 0) {
        reply.header("set-cookie", setCookies);
      }

      return reply.redirect(next);
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
