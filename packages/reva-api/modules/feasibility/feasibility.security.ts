import {
  defaultSecurity,
  isAdminOrCandidacyCompanion,
  isAnyone,
} from "../shared/security/presets";

export const resolversSecurityMap = {
  // Sécurité par défaut
  // cf https://the-guild.dev/graphql/tools/docs/resolvers-composition#supported-path-matcher-format
  "Query.*": isAnyone,

  "Query.feasibility_getActiveFeasibilityByCandidacyId":
    isAdminOrCandidacyCompanion,

  "Mutation.*": defaultSecurity,
};
