import dotenv from "dotenv";
import { FastifyReply, FastifyRequest } from "fastify";
import * as jose from "jose";
import { getGraphQlClient } from "../../utils/graphqlClient.js";
import { Client } from "@urql/core";

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
  if (request.url === "/v1/docs" || request.url === "/v1/schema.json") {
    return;
  }
  const jwt =
    "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJmdmFlLWludGVyb3AtYXNwIiwiYXVkIjoiZnZhZS1pbnRlcm9wIiwic3ViIjoiMTIzNDU2Nzg5MCIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoyNzE2MjM5MDIyfQ.YLk6X46H2ZDK2FJXwQj1Pyw1eF2Le2Lp9XTFC9ngY5BUQ_ihPKbC6IYoaeJmhnffDWq34gtCsdJVsOgySMFwkg";

  const { payload, protectedHeader } = await jose.jwtVerify(jwt, secretKey, {
    issuer: "fvae-interop-asp",
    requiredClaims: ["iat", "exp", "sub"],
    audience: "fvae-interop",
    algorithms: ["HS512"],
    // maxTokenAge: "1h",
  });

  const graphqlClient = getGraphQlClient(jwt);
  request.graphqlClient = graphqlClient;
  // request.graphqlQuery = getGraphqlQuery(graphqlClient);

  console.log(protectedHeader);
  console.log(payload);
};
