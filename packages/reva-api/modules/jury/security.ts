import {
  defaultSecurity,
  isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
  isAnyone,
} from "../shared/security/presets";

export const resolversSecurityMap = {
  // Sécurité par défaut
  // cf https://the-guild.dev/graphql/tools/docs/resolvers-composition#supported-path-matcher-format

  "Mutation.*": defaultSecurity, // forbidden
  "Mutation.jury_updateResult": isAnyone,
  "Candidacy.jury": isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
  "Jury.candidacy": isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
};
