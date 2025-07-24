import {
  defaultSecurity,
  isAdmin,
  isAdminCandidacyCompanionOrFeasibilityManager,
  isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
  isAnyone,
  isOwnerOfCandidacy,
} from "@/modules/shared/security/presets";

export const resolversSecurityMap = {
  // Sécurité par défaut
  // cf https://the-guild.dev/graphql/tools/docs/resolvers-composition#supported-path-matcher-format
  "Query.*": isAnyone,

  "Query.feasibility_getActiveFeasibilityByCandidacyId":
    isAdminCandidacyCompanionOrFeasibilityManager,

  "Mutation.*": defaultSecurity,

  "Mutation.feasibility_updateFeasibilityFileTemplateFirstReadAt":
    isOwnerOfCandidacy,

  "Mutation.feasibility_revokeCertificationAuthorityDecision": isAdmin,

  "Candidacy.feasibility":
    isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,

  "Feasibility.candidacy": isAdminCandidacyCompanionOrFeasibilityManager,
};
