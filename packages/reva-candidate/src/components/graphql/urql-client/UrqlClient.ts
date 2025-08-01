import { authExchange } from "@urql/exchange-auth";
import { Client, fetchExchange } from "urql";

import { useKeycloakContext } from "@/components/auth/keycloak.context";
import { GRAPHQL_API_URL } from "@/config/config";

export const useUrqlClient = () => {
  const { accessToken } = useKeycloakContext();

  const urqlClient = new Client({
    url: GRAPHQL_API_URL,
    exchanges: [
      authExchange(async (utils) => {
        return {
          addAuthToOperation(operation) {
            if (!accessToken) return operation;
            return utils.appendHeaders(operation, {
              Authorization: `Bearer ${accessToken}`,
            });
          },
          didAuthError: (error) => {
            return error.graphQLErrors.some(
              (e) => e.extensions?.code === "UNAUTHENTICATED",
            );
          },
          refreshAuth: async () => {},
        };
      }),
      fetchExchange,
    ],
  });

  return urqlClient;
};
