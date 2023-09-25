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
import mercurius, { MercuriusOptions } from "mercurius";

import * as account from "./account";
import * as candidacy from "./candidacy";
import * as candidate from "./candidate";
import { feasibilityLoaders } from "./feasibility/feasibility.loaders";
import { feasibilityResolvers } from "./feasibility/feasibility.resolvers";
import { financeUnifvaeResolvers } from "./finance/unifvae/finance.unifvae.resolvers";
import { financeResolvers } from "./finance/unireva/finance.resolvers";
import { organismLoaders } from "./organism/organism.loaders";
import { referentialResolvers } from "./referential/referential.resolvers";
import { logger } from "./shared/logger";
import DecimalGraphqlScalar from "./shared/scalar/DecimalGraphqlScalar";
import { subscriptionRequestResolvers } from "./subscription/subscription.resolvers";

// Resolvers

const typeDefs = loadFilesSync(path.join(__dirname, "."), {
  extensions: ["graphql"],
  recursive: true,
});

const resolvers = mergeResolvers([
  candidacy.resolvers,
  referentialResolvers,
  account.resolvers,
  candidate.resolvers,
  financeResolvers,
  subscriptionRequestResolvers,
  feasibilityResolvers,
  financeUnifvaeResolvers,
]);
resolvers.Void = VoidResolver;
resolvers.Timestamp = TimestampResolver;
resolvers.UUID = UUIDResolver;
resolvers.Decimal = DecimalGraphqlScalar;

export const graphqlConfiguration: MercuriusOptions = {
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
  loaders: { ...feasibilityLoaders, ...organismLoaders },
  errorFormatter: (error, ...args) => {
    error.errors
      ? error.errors.forEach((e) => logger.error(e))
      : logger.error(error);

    return {
      ...mercurius.defaultErrorFormatter(error, ...args),
      statusCode: 200,
    };
  },
};
