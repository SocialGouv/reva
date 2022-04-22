import * as path from "path";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";

// Resolvers

import * as search from "./search";
import * as candidacy from "./candidacy";
import * as referential from "./referential";

const typeDefs = loadFilesSync(path.join(__dirname, "."), {
  extensions: ["graphql"],
  recursive: true,
});
const resolvers = mergeResolvers([search.resolvers, candidacy.resolvers, referential.resolvers]);

export const graphqlConfiguration = {
  schema: makeExecutableSchema({
    typeDefs: mergeTypeDefs(typeDefs),
    resolvers,
  }),
  graphiql: !!process.env.GRAPHIQL,
};
