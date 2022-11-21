import * as path from "path";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { VoidTypeDefinition, VoidResolver, TimestampTypeDefinition, TimestampResolver, UUIDResolver, UUIDDefinition } from 'graphql-scalars';

// Resolvers

import * as search from "./search";
import * as candidacy from "./candidacy";
import * as candidate from "./candidate";
import * as referential from "./referential";
import * as account from "./account";

const typeDefs = loadFilesSync(path.join(__dirname, "."), {
  extensions: ["graphql"],
  recursive: true,
});

const resolvers = mergeResolvers([
  search.resolvers, 
  candidacy.resolvers, 
  referential.resolvers,
  account.resolvers,
  candidate.resolvers
]);
resolvers.Void = VoidResolver;
resolvers.Timestamp = TimestampResolver;
resolvers.UUID = UUIDResolver

export const graphqlConfiguration = {
  schema: makeExecutableSchema({
    typeDefs: mergeTypeDefs([...typeDefs
      , TimestampTypeDefinition
      , VoidTypeDefinition
      , UUIDDefinition
    ]),
    resolvers,
  }),
  context: (request: { auth: any }) => {
    return {auth: request.auth}
  },
  graphiql: !!process.env.GRAPHIQL,
};
