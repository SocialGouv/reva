import {
  defaultSecurity,
  isAdminOrCandidacyCompanion,
} from "../shared/security/presets";

export const resolversSecurityMap = {
  // Sécurité par défaut
  // cf https://the-guild.dev/graphql/tools/docs/resolvers-composition#supported-path-matcher-format

  "Query.*": defaultSecurity, // forbidden
  "Mutation.*": defaultSecurity, // forbidden

  "Query.candidacyMenu_getCandidacyMenu": isAdminOrCandidacyCompanion,
};
