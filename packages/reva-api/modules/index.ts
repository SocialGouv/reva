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

import { loaders as accountLoaders } from "./account/account.loaders";
import { resolvers as accountResolvers } from "./account/account.resolvers";
import * as candidacy from "./candidacy";
import * as candidate from "./candidate";
import { certificationAuthorityLoaders } from "./certification-authority/certification-authority.loaders";
import { resolvers as certificationAuthorityResolvers } from "./certification-authority/certification-authority.resolvers";
import { feasibilityLoaders } from "./feasibility/feasibility.loaders";
import { feasibilityResolvers } from "./feasibility/feasibility.resolvers";
import { featureFlippingResolvers } from "./feature-flipping/feature-flipping.resolvers";
import { financeUnifvaeResolvers } from "./finance/unifvae/finance.unifvae.resolvers";
import { financeResolvers } from "./finance/unireva/finance.resolvers";
import { organismLoaders } from "./organism/organism.loaders";
import { resolvers as organismResolvers } from "./organism/organism.resolvers";
import { referentialLoaders } from "./referential/referential.loaders";
import { referentialResolvers } from "./referential/referential.resolvers";
import { logger } from "./shared/logger";
import DecimalGraphqlScalar from "./shared/scalar/DecimalGraphqlScalar";
import { subscriptionRequestResolvers } from "./subscription/subscription.resolvers";

// Resolvers

const typeDefs = loadFilesSync(
  path.join(__dirname, "./**/!(generated-graphql-schema).graphql")
);

const resolvers = mergeResolvers([
  candidacy.resolvers,
  referentialResolvers,
  accountResolvers,
  candidate.resolvers,
  financeResolvers,
  subscriptionRequestResolvers,
  feasibilityResolvers,
  financeUnifvaeResolvers,
  organismResolvers,
  certificationAuthorityResolvers,
  feasibilityResolvers,
  featureFlippingResolvers,
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
  loaders: {
    ...accountLoaders,
    ...feasibilityLoaders,
    ...organismLoaders,
    ...certificationAuthorityLoaders,
    ...referentialLoaders,
  },
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
