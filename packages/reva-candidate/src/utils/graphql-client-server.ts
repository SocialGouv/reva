import { GraphQLClient } from "graphql-request";

import { GRAPHQL_API_URL } from "@/config/config";

import { cookies } from "next/headers";

export const getGraphQlClient = () => {
  const cookieStore = cookies();

  const tokens = cookieStore.get("tokens");
  const accessToken = JSON.parse(tokens?.value || "{}").accessToken;

  const headers: HeadersInit = {};
  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`;
  }

  const graphqlClient = new GraphQLClient(GRAPHQL_API_URL, { headers });

  return graphqlClient;
};
