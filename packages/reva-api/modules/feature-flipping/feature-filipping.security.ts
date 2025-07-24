import {
  defaultSecurity,
  isAdmin,
  isAnyone,
} from "@/modules/shared/security/presets";

export const featureFlippingResolversSecurityMap = {
  // Sécurité par défaut
  // cf https://the-guild.dev/graphql/tools/docs/resolvers-composition#supported-path-matcher-format

  "Query.*": defaultSecurity, // forbidden
  "Mutation.*": defaultSecurity, // forbidden

  "Query.activeFeaturesForConnectedUser": isAnyone,
  "Query.featureFlipping_getFeatures": isAdmin,
  "Mutation.featureFlipping_toggleFeature": isAdmin,
};
