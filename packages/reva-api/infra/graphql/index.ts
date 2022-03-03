import * as path from "path";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";

// Resolvers

import * as search from "./search";

const typeDefs = loadFilesSync(path.join(__dirname, "."), {
  extensions: ["graphql"],
  recursive: true,
});
const resolvers = mergeResolvers([search.resolvers]);

export const graphqlConfiguration = {
  schema: makeExecutableSchema({
    typeDefs: mergeTypeDefs(typeDefs),
    resolvers,
  }),
  graphiql: !!process.env.GRAPHIQL,
};
