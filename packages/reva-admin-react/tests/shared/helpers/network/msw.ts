import {
  graphql,
  HttpResponse,
} from "next/experimental/testmode/playwright/msw";

import type { JsonObject } from "type-fest";

type GraphQLLink = ReturnType<typeof graphql.link>;
type GraphQLResolver = Parameters<GraphQLLink["query"]>[1];

type DataArg = JsonObject | { data: JsonObject };

export function graphQLResolver(payload: DataArg): GraphQLResolver {
  const data = payload.data
    ? (payload.data as JsonObject)
    : (payload as JsonObject);

  return () => {
    return HttpResponse.json({
      data,
    });
  };
}
