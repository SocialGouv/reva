import { Client, cacheExchange, fetchExchange } from "@urql/core";

export const getGraphQlClient = (accessToken: string) => {
  const client = new Client({
    url: process.env.GRAPHQL_API_URL || "http://localhost:8080/api/graphql",
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: () => {
      return {
        headers: { authorization: accessToken ? `Bearer ${accessToken}` : "" },
      };
    },
  });
  return client;
};
