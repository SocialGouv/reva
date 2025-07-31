import { Client } from "@urql/core";
import dotenv from "dotenv";
import { FastifyReply, FastifyRequest } from "fastify";

import { getGraphQlClient } from "../../utils/graphqlClient.js";
import { parseJwt } from "../../utils/jwt.js";
import { getUserAccessToken } from "../../utils/keycloak.js";

import { findSessionById } from "./features/session/findSessionById.js";

declare module "fastify" {
  interface FastifyRequest {
    graphqlClient: Client;
    // graphqlQuery: GraphqlQuery<unknown, AnyVariables>;
  }
}

dotenv.config({ path: "./.env" });

export const validateJwt = async (
  request: FastifyRequest,
  _reply: FastifyReply,
) => {
  const securePathes = [
    "candidatures",
    "dossiersDeFaisabilite",
    "dossiersDeValidation",
    "informationsJury",
  ];

  const isSecurePath = securePathes.some((path) =>
    request.url.startsWith(`/interop/v1/${path}`),
  );

  if (!isSecurePath) {
    return;
  }

  if (!process.env.ENVIRONMENT || process.env.ENVIRONMENT === "") {
    throw new Error("ENVIRONMENT env var is missing");
  }

  const jwt = getTokenFromRequest(request);

  const payload = await parseJwt({ token: jwt });

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
