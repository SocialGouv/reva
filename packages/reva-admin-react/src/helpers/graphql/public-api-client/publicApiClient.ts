import { createClient, fetchExchange } from "urql";

import { GRAPHQL_API_URL } from "@/config/config";

export const publicApiClient = createClient({
  url: GRAPHQL_API_URL,
  exchanges: [fetchExchange],
});
