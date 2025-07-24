import {
  defaultSecurity,
  isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
  isAdminOrCandidacyCompanion,
  isAnyone,
  isAdmin,
} from "@/modules/shared/security/presets";

export const resolversSecurityMap = {
  // Sécurité par défaut
  // cf https://the-guild.dev/graphql/tools/docs/resolvers-composition#supported-path-matcher-format

  "Mutation.*": defaultSecurity, // forbidden

  "Mutation.jury_updateExamInfo": isAdminOrCandidacyCompanion,
  "Mutation.jury_updateResult": isAnyone,
  "Mutation.jury_revokeDecision": isAdmin,

  "Candidacy.jury": isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
  "Candidacy.examInfo":
    isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
  "Jury.candidacy": isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
};
