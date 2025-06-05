import {
  defaultSecurity,
  isAdminCandidacyCompanionOrFeasibilityManager,
  isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
  isAnyone,
  isOwnerOfCandidacy,
} from "../shared/security/presets";

export const resolversSecurityMap = {
  // Sécurité par défaut
  // cf https://the-guild.dev/graphql/tools/docs/resolvers-composition#supported-path-matcher-format
  "Query.*": isAnyone,

  "Query.feasibility_getActiveFeasibilityByCandidacyId":
    isAdminCandidacyCompanionOrFeasibilityManager,

  "Mutation.*": defaultSecurity,

  "Mutation.feasibility_updateFeasibilityFileTemplateFirstReadAt":
    isOwnerOfCandidacy,

  "Candidacy.feasibility":
    isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,

  "Feasibility.candidacy": isAdminCandidacyCompanionOrFeasibilityManager,
};
