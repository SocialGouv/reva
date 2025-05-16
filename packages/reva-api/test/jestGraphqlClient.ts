import { GraphQLClient } from "graphql-request";

interface GraphQLClientParams {
  headers?: HeadersInit;
}

export const getGraphQLClient = (params: GraphQLClientParams) => {
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

export const getGraphQLError = (_error: unknown) => {
  const error = _error as GraphQLError;
  const message = error?.response?.errors
    ?.map((e: { message?: string }) => e?.message)
    ?.join(", ");

  return message ?? error?.message ?? JSON.stringify(error);
};
