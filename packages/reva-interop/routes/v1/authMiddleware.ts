import { Client } from "@urql/core";
import dotenv from "dotenv";
import { FastifyRequest } from "fastify";

import { ERROR_UNAUTHORIZED } from "../../utils/errors.js";
import { getGraphQlClient } from "../../utils/graphqlClient.js";
import { parseJwt } from "../../utils/jwt.js";
import { getUserAccessToken } from "../../utils/keycloak.js";

import { findSessionById } from "./features/session/findSessionById.js";

declare module "fastify" {
  interface FastifyRequest {
    graphqlClient: Client;
    keycloakId: string;
    keycloakJwt: string;
  }
}

dotenv.config({ path: "./.env" });

export const validateJwt = async (
  securePathes: string[],
  request: FastifyRequest,
  // _reply: FastifyReply,
) => {
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
    throw new Error(ERROR_UNAUTHORIZED);
  }

  const session = await findSessionById(sessionId);
  if (!session) {
    throw new Error(ERROR_UNAUTHORIZED);
  }

  if (session.endedAt) {
    throw new Error(ERROR_UNAUTHORIZED);
  }

  const keycloakJwt = await getUserAccessToken({
    keycloakId: session.keycloakId,
  });
  if (!keycloakJwt) {
    throw new Error(ERROR_UNAUTHORIZED);
  }

  const graphqlClient = getGraphQlClient(keycloakJwt);

  request.graphqlClient = graphqlClient;
  request.keycloakId = session.keycloakId;
  request.keycloakJwt = keycloakJwt;
};

const getTokenFromRequest = (request: FastifyRequest) => {
  const {
    headers: { authorization },
  } = request;

  const [, token] = authorization?.split("Bearer ") || [];

  if (token) {
    return token;
  }

  throw new Error(ERROR_UNAUTHORIZED);
};
