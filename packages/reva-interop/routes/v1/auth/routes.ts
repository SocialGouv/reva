import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import * as jose from "jose";

import { createAccount } from "../features/accounts/createAccount.js";
import { generateJwt } from "../features/auth/generateJwt.js";
import { invalidJwt } from "../features/auth/invalideJwt.js";

const authRoutesApiV1: FastifyPluginAsyncJsonSchemaToTs = async (fastify) => {
  fastify.post(
    "/documentation/openid-connect/token",
    {
      schema: {
        hide: true,
        consumes: ["application/x-www-form-urlencoded"],
        produces: ["application/x-www-form-urlencoded"],
        body: {
          type: "object",
          required: ["grant_type", "code", "client_id", "redirect_uri"],
          properties: {
            grant_type: { type: "string" },
            code: { type: "string" },
            client_id: { type: "string" },
            redirect_uri: { type: "string" },
          },
        },
      },
    },
    async (request) => {
      const requestBody = request.body;
      const tokenReply = await fetch(
        `${process.env.KEYCLOAK_ADMIN_URL}/realms/${process.env.KEYCLOAK_REVA_ADMIN_REALM}/protocol/openid-connect/token`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: "POST",
          body: new URLSearchParams({
            grant_type: requestBody.grant_type,
            code: requestBody.code,
            client_id: requestBody.client_id,
            redirect_uri: requestBody.redirect_uri,
          }),
        },
      );
      const tokenJson = await tokenReply.json();
      const idToken = tokenJson.id_token;
      const decodedIdToken = jose.decodeJwt(idToken);
      const keycloakId = decodedIdToken.sub;
      if (!keycloakId) {
        throw new Error("keycloakId has not been set");
      }

      const jwt = await generateJwt({ keycloakId });

      return {
        access_token: jwt,
      };
    },
  );

  fastify.route({
    method: "POST",
    url: "/auth/createAccount",
    schema: {
      hide:
        process.env.ENVIRONMENT !== "local" &&
        process.env.ENVIRONMENT !== "staging",
      summary:
        "Crée un compte d'utilisateur rattaché au gestionnaire de candidature passé en paramètre",
      tags: ["Authentification"],
      body: {
        type: "object",
        properties: {
          certificationAuthorityId: {
            type: "string",
            description: "Identifiant de l'utilisateur",
          },
          email: {
            type: "string",
            description: "Email de l'utilisateur",
          },
          firstname: {
            type: "string",
            description: "Prénom de l'utilisateur",
          },
          lastname: {
            type: "string",
            description: "Nom de famille de l'utilisateur",
          },
          username: {
            type: "string",
            description: "Nom d'utilisateur",
          },
        },
        required: ["certificationAuthorityId", "email", "username"],
      },
      response: {
        200: {
          description: "Compte créé avec succès",
          type: "object",
          properties: {
            keycloakId: {
              type: "string",
              description: "Identifiant Keycloak du compte créé",
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const account = await createAccount(request.graphqlClient, {
        ...request.body,
        group: "certification_authority",
      });
      if (!account || !account.keycloakId) {
        throw new Error("Failed to create account");
      }
      reply.send({ keycloakId: account.keycloakId });
    },
  });

  fastify.route({
    method: "POST",
    url: "/auth/generateJwt",
    schema: {
      hide:
        process.env.ENVIRONMENT !== "local" &&
        process.env.ENVIRONMENT !== "staging",
      summary: "Génère un jeton d'accès pour l'utilisateur demandé",
      tags: ["Authentification"],
      headers: {
        type: "object",
        properties: {
          auth_api_key: { type: "string" },
        },
        required: ["auth_api_key"],
      },
      body: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            format: "uuid",
            description: "Identifiant de l'utilisateur",
          },
        },
        required: ["userId"],
      },
      response: {
        200: {
          description: "Génération du JWT avec succès",
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "JWT",
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { auth_api_key } = request.headers;

      if (!auth_api_key || auth_api_key != process.env.AUTH_API_KEY) {
        reply.status(401).send();
        return;
      }

      const jwt = await generateJwt({ keycloakId: request.body.userId });

      return {
        token: jwt,
      };
    },
  });

  fastify.route({
    method: "POST",
    url: "/auth/invalidJwt",
    schema: {
      hide:
        process.env.ENVIRONMENT !== "local" &&
        process.env.ENVIRONMENT !== "staging",
      summary: "Invalide le jeton d'accès",
      tags: ["Authentification"],
      headers: {
        type: "object",
        properties: {
          auth_api_key: { type: "string" },
        },
        required: ["auth_api_key"],
      },
      body: {
        type: "object",
        properties: {
          token: {
            type: "string",
            description: "JWT",
          },
        },
        required: ["token"],
      },
    },
    handler: async (request, reply) => {
      const { auth_api_key } = request.headers;

      if (!auth_api_key || auth_api_key != process.env.AUTH_API_KEY) {
        reply.status(401).send();
        return;
      }

      await invalidJwt({ token: request.body.token });

      reply.status(204).send();
    },
  });
};

export default authRoutesApiV1;
