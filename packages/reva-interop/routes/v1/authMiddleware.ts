import dotenv from "dotenv";
import { FastifyReply, FastifyRequest } from "fastify";
import * as jose from "jose";
import { getGraphQlClient } from "../../utils/graphqlClient.js";
import { Client } from "@urql/core";
import { getUserAccessToken } from "../../utils/keycloak.js";

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
    request.url === "/interop/v1/schema.json"
  ) {
    return;
  }

  const jwt = getTokenFromRequest(request);

  // const jwt =
  //   "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJmdmFlLWludGVyb3AtYXNwIiwiYXVkIjoiZnZhZS1pbnRlcm9wIiwic3ViIjoiMTIzNDU2Nzg5MCIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoyNzE2MjM5MDIyfQ.YLk6X46H2ZDK2FJXwQj1Pyw1eF2Le2Lp9XTFC9ngY5BUQ_ihPKbC6IYoaeJmhnffDWq34gtCsdJVsOgySMFwkg";

  const { payload, protectedHeader } = await jose.jwtVerify(jwt, secretKey, {
    issuer: "fvae-interop-asp",
    requiredClaims: ["iat", "exp", "sub"],
    audience: "fvae-interop",
    algorithms: ["HS512"],
    // maxTokenAge: "1h",
  });

  const keycloakId = payload.sub;
  if (!keycloakId) {
    throw new Error("Unauthorized");
  }

  const keycloakJwt = await getUserAccessToken({ keycloakId });
  if (!keycloakJwt) {
    throw new Error("Unauthorized");
  }

  const graphqlClient = getGraphQlClient(keycloakJwt);

  request.graphqlClient = graphqlClient;
  // request.graphqlQuery = getGraphqlQuery(graphqlClient);

  console.log(protectedHeader);
  console.log(payload);
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
