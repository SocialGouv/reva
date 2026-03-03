import { HttpResponse } from "msw";

import type { GraphQLResponseResolver } from "msw";
import type { JsonObject } from "type-fest";

type DataArg = JsonObject | { data: JsonObject };

export function graphQLResolver(payload: DataArg): GraphQLResponseResolver {
  const body = (payload.data ? payload.data : payload) as Record<
    string,
    unknown
  >;
  return () => HttpResponse.json({ data: body });
}
