import { createClient, fetchExchange } from "@urql/core";

const url =
  (process.env.GRAPHQL_API_URL as string) ||
  "http://localhost:8080/api/graphql";

export const client = createClient({
  url,
  exchanges: [fetchExchange],
});
