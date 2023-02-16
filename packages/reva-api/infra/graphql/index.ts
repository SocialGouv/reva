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
import { financeResolvers } from "./finance/finance.resolvers";
import * as referential from "./referential";
import DecimalGraphqlScalar from "./scalar/DecimalGraphqlScalar";
import * as search from "./search";
import { subscriptionRequestResolvers } from "./subscription/subscription.resolvers";

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
  financeResolvers,
  subscriptionRequestResolvers,
]);
resolvers.Void = VoidResolver;
resolvers.Timestamp = TimestampResolver;
resolvers.UUID = UUIDResolver;
resolvers.Decimal = DecimalGraphqlScalar;

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
  graphiql: !!process.env.GRAPHIQL,
  errorFormatter: (result: any) => {
    const statusCode = result.errors[0].originalError?.statusCode ?? 400;
    let errors = result.errors;

    if (result.errors[0].extensions?.errors?.length) {
      errors =
        result.errors[0].extensions.errors.map((error: string) => ({
          message: error,
          path: result.errors[0].path,
          location: result.errors[0].location,
        })) || [];
    }

    return {
      statusCode,
      response: {
        errors,
      },
    };
  },
};
