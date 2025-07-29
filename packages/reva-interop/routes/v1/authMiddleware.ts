import { Client } from "@urql/core";
import dotenv from "dotenv";
import { FastifyReply, FastifyRequest } from "fastify";
import * as jose from "jose";

import { getGraphQlClient } from "../../utils/graphqlClient.js";
import { getUserAccessToken } from "../../utils/keycloak.js";
import { findSessionById } from "../../utils/session.js";

declare module "fastify" {
  interface FastifyRequest {
    graphqlClient: Client;
    // graphqlQuery: GraphqlQuery<unknown, AnyVariables>;
  }
}

dotenv.config({ path: "./.env" });

const secretKey = new TextEncoder().encode(process.env.SECRET_KEY);

export const validateJwt = async (
  request: FastifyRequest,
  _reply: FastifyReply,
) => {
  if (
    request.url === "/interop/v1/docs" ||
    request.url.startsWith("/interop/v1/documentation")
  ) {
    return;
  }
  if (!process.env.ENVIRONMENT || process.env.ENVIRONMENT === "") {
    throw new Error("ENVIRONMENT env var is missing");
  }

  const jwt = getTokenFromRequest(request);

  // const jwt =
  //   "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJmdmFlLWludGVyb3AtYXNwIiwiYXVkIjoiZnZhZS1pbnRlcm9wIiwic3ViIjoiYWNiMzY3ODgtNDA3Yy00MTRlLTlkMzMtMjMzYjJhMWNhMjQwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjM3MTYyMzkwMjJ9.cRKBfFM9TrpANOdNZTOGKS4QZ4C-PzD0RKtnYUVz1whBUGGGA2btlPk4GQQzp7QHRusFu44vgxuw8XGg1Kg6Ug";
  const { payload } = await jose.jwtVerify(jwt, secretKey, {
    issuer: `fvae-interop-${process.env.ENVIRONMENT}`,
    requiredClaims: ["iat", "sub"],
    audience: "fvae-interop",
    algorithms: ["HS512"],

    // maxTokenAge: "1h",
  });

  const sessionId = payload.sub;
  if (!sessionId) {
    throw new Error("Unauthorized");
  }

  const session = await findSessionById(sessionId);
  if (!session) {
    throw new Error("Unauthorized");
  }

  if (session.endedAt) {
    throw new Error("Unauthorized");
  }

  const keycloakJwt = await getUserAccessToken({
    keycloakId: session.keycloakId,
  });
  if (!keycloakJwt) {
    throw new Error("Unauthorized");
  }

  const graphqlClient = getGraphQlClient(keycloakJwt);

  request.graphqlClient = graphqlClient;
};

const getTokenFromRequest = (request: FastifyRequest) => {
  const {
    headers: { authorization },
  } = request;

  const [, token] = authorization?.split("Bearer ") || [];

  if (token) {
    return token;
  }

  throw new Error("Unauthorized");
};
