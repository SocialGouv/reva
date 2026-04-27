import { createClient, fetchExchange } from "@urql/core";

import { GRAPHQL_API_URL } from "@/config/config";

export const client = createClient({
  url: GRAPHQL_API_URL,
  exchanges: [fetchExchange],
});
