import { GraphQLClient } from "graphql-request";
import { GraphQLClientRequestHeaders } from "graphql-request/build/esm/types";

interface QraphQLClientParams {
  headers?: GraphQLClientRequestHeaders;
}

export const getGraphqlClient = (params: QraphQLClientParams) => {
  const { headers } = params;

  const url = `http://localhost:${process.env.PORT || 8081}/api/graphql`;
  const client = new GraphQLClient(url, {
    headers,
  });

  return client;
};

interface GraphQLError {
  response?: {
    errors?: Array<{ message?: string }>;
  };
  message?: string;
}

export const getQraphQLError = (_error: unknown) => {
  const error = _error as GraphQLError;
  const message = error?.response?.errors
    ?.map((e: { message?: string }) => e?.message)
    ?.join(", ");

  return message ?? error?.message ?? JSON.stringify(error);
};
