import { GraphQLClient } from "graphql-request";

interface GraphQLClientParams {
  headers?: HeadersInit;
}

export const getGraphQLClient = (params: GraphQLClientParams) => {
  const { headers } = params;

  // Get the dynamic port from the global test app
  const testApp = global.testApp;
  if (!testApp) {
    throw new Error(
      "Test app not available. Make sure tests are properly set up.",
    );
  }

  const address = testApp.server.address();
  const port = typeof address === "object" && address ? address.port : 8081;

  const url = `http://localhost:${port}/api/graphql`;
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
