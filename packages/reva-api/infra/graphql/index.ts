import * as path from "path";

import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  TimestampResolver,
  TimestampTypeDefinition,
  UUIDDefinition,
  UUIDResolver,
  VoidResolver,
  VoidTypeDefinition,
} from "graphql-scalars";

import * as account from "./account";
import * as candidacy from "./candidacy";
import * as candidate from "./candidate";
import * as referential from "./referential";
import * as search from "./search";

// Resolvers

const typeDefs = loadFilesSync(path.join(__dirname, "."), {
  extensions: ["graphql"],
  recursive: true,
});

const resolvers = mergeResolvers([
  search.resolvers,
  candidacy.resolvers,
  referential.resolvers,
  account.resolvers,
  candidate.resolvers,
]);
resolvers.Void = VoidResolver;
resolvers.Timestamp = TimestampResolver;
resolvers.UUID = UUIDResolver;

export const graphqlConfiguration = {
  schema: makeExecutableSchema({
    typeDefs: mergeTypeDefs([
      ...typeDefs,
      TimestampTypeDefinition,
      VoidTypeDefinition,
      UUIDDefinition,
    ]),
    resolvers,
  }),
  context: (request: { auth: any }) => {
    return { auth: request.auth };
  },
  graphiql: !!process.env.GRAPHIQL,
};
