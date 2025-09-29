import * as path from "path";

import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { NoSchemaIntrospectionCustomRule } from "graphql";
import {
  DateResolver,
  TimeResolver,
  TimestampResolver,
  TimestampTypeDefinition,
  UUIDDefinition,
  UUIDResolver,
  VoidResolver,
  VoidTypeDefinition,
} from "graphql-scalars";
import { GraphQLUpload } from "graphql-upload-minimal";
import mercurius, { MercuriusOptions } from "mercurius";

import { aapLogLoaders } from "./aap-log/aap-log.loaders";
import { aapLogResolvers } from "./aap-log/aap-log.resolvers";
import { loaders as accountLoaders } from "./account/account.loaders";
import { resolvers as accountResolvers } from "./account/account.resolvers";
import { appointmentResolvers } from "./appointment/appointment.resolvers";
import { candidacyResolvers } from "./candidacy/candidacy.resolvers";
import { certificationResolvers } from "./candidacy/certification/certification.resolvers";
import { trainingResolvers } from "./candidacy/training/training.resolvers";
import { candidacyLogLoaders } from "./candidacy-log/candidacy-log.loaders";
import { candidacyLogResolvers } from "./candidacy-log/candidacy-log.resolvers";
import { candidacyMenuResolvers } from "./candidacy-menu/candidacy-menu.resolvers";
import { candidateResolvers } from "./candidate/candidate.resolvers";
import { certificationAuthorityLoaders } from "./certification-authority/certification-authority.loaders";
import { resolvers as certificationAuthorityResolvers } from "./certification-authority/certification-authority.resolvers";
import { dossierDeValidationResolvers } from "./dossier-de-validation/dossier-de-validation.resolvers";
import { dematerializedFeasibilityFileResolvers } from "./feasibility/dematerialized-feasibility-file/dematerialized-feasibility-file.resolvers";
import { feasibilityUploadedPdfResolvers } from "./feasibility/feasibility-uploaded-pdf/feasibility-uploaded-pdf.resolvers";
import { feasibilityResolvers } from "./feasibility/feasibility.resolvers";
import { featureFlippingResolvers } from "./feature-flipping/feature-flipping.resolvers";
import { financeUnifvaeResolvers } from "./finance/unifvae/finance.unifvae.resolvers";
import { financeResolvers } from "./finance/unireva/finance.resolvers";
import { juryResolvers } from "./jury/jury.resolvers";
import { organismResolvers } from "./organism/organism.resolvers";
import { referentialLoaders } from "./referential/referential.loaders";
import { referentialResolvers } from "./referential/referential.resolvers";
import { logger } from "./shared/logger/logger";
import DecimalGraphqlScalar from "./shared/scalar/DecimalGraphqlScalar";
import { subscriptionRequestResolvers } from "./subscription/subscription.resolvers";
import { vaeCollectiveResolvers } from "./vae-collective/vae-collective.resolvers";

// Resolvers

const typeDefs = loadFilesSync(
  path.join(__dirname, "./**/!(generated-graphql-schema).graphql"),
);

const resolvers = mergeResolvers([
  candidacyResolvers,
  referentialResolvers,
  accountResolvers,
  candidateResolvers,
  financeResolvers,
  subscriptionRequestResolvers,
  financeUnifvaeResolvers,
  organismResolvers,
  certificationAuthorityResolvers,
  feasibilityResolvers,
  featureFlippingResolvers,
  dossierDeValidationResolvers,
  juryResolvers,
  candidacyLogResolvers,
  aapLogResolvers,
  candidacyMenuResolvers,
  dematerializedFeasibilityFileResolvers,
  feasibilityUploadedPdfResolvers,
  trainingResolvers,
  certificationResolvers,
  vaeCollectiveResolvers,
  appointmentResolvers,
]);
resolvers.Void = VoidResolver;
resolvers.Timestamp = TimestampResolver;
resolvers.UUID = UUIDResolver;
resolvers.Decimal = DecimalGraphqlScalar;
resolvers.Upload = GraphQLUpload;
resolvers.Date = DateResolver;
resolvers.Time = TimeResolver;

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
    ...certificationAuthorityLoaders,
    ...referentialLoaders,
    ...candidacyLogLoaders,
    ...aapLogLoaders,
  },
  validationRules:
    process.env.NODE_ENV === "production"
      ? [NoSchemaIntrospectionCustomRule]
      : undefined,

  errorFormatter: (error, ...args) => {
    if (error.errors) {
      error.errors.forEach((e) => logger.error(e));
    } else {
      logger.error(error);
    }

    return {
      ...mercurius.defaultErrorFormatter(error, ...args),
      statusCode: 200,
    };
  },
};
