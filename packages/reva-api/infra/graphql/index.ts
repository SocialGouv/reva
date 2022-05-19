import * as path from "path";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLScalarType } from "graphql"

// Resolvers

import * as search from "./search";
import * as candidacy from "./candidacy";
import * as referential from "./referential";

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  parseValue(value: any) {
    return new Date(value);
  },
  serialize(value: any) {
    return value.getTime();
  },
})

const Void = new GraphQLScalarType({
    name: 'Void',
    description: 'Represents NULL values',
    serialize() {
        return null
    },
    parseValue() {
        return null
    },
    parseLiteral() {
        return null
    }
})

const typeDefs = loadFilesSync(path.join(__dirname, "."), {
  extensions: ["graphql"],
  recursive: true,
});
const resolvers = mergeResolvers([search.resolvers, candidacy.resolvers, referential.resolvers]);
resolvers.Date = dateScalar
resolvers.Void = Void

export const graphqlConfiguration = {
  schema: makeExecutableSchema({
    typeDefs: mergeTypeDefs(typeDefs),
    resolvers,
  }),
  graphiql: !!process.env.GRAPHIQL,
};
