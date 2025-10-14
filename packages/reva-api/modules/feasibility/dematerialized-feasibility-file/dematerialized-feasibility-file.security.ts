import {
  defaultSecurity,
  isAdminOrCandidacyCompanion,
  isAdminOrCertificationAuthority,
  isAdminOrOwnerOfCandidacy,
  isOwnerOrCanManageCandidacy,
} from "@/modules/shared/security/presets";

export const resolversSecurityMap = {
  // Sécurité par défaut
  // cf https://the-guild.dev/graphql/tools/docs/resolvers-composition#supported-path-matcher-format
  "Query.*": defaultSecurity,

  "Mutation.*": defaultSecurity,

  "Mutation.dematerialized_feasibility_file_createOrUpdateCertificationInfo":
    isAdminOrCandidacyCompanion,

  "Mutation.dematerialized_feasibility_file_createOrUpdateCertificationCompetenceDetails":
    isAdminOrCandidacyCompanion,

  "Mutation.dematerialized_feasibility_file_createOrUpdatePrerequisites":
    isAdminOrCandidacyCompanion,

  "Mutation.dematerialized_feasibility_file_createOrUpdateAapDecision":
    isAdminOrCandidacyCompanion,

  "Mutation.dematerialized_feasibility_file_createOrUpdateAttachments":
    isAdminOrCandidacyCompanion,

  "Mutation.dematerialized_feasibility_file_sendToCandidate":
    isAdminOrCandidacyCompanion,

  "Mutation.dematerialized_feasibility_file_sendToCertificationAuthority":
    isAdminOrCandidacyCompanion,

  "Mutation.dematerialized_feasibility_file_createOrUpdateSwornStatement":
    isOwnerOrCanManageCandidacy,

  "Mutation.dematerialized_feasibility_file_createOrUpdateCertificationAuthorityDecision":
    isAdminOrCertificationAuthority,

  "Mutation.dematerialized_feasibility_file_confirmCandidate":
    isAdminOrOwnerOfCandidacy,

  "Mutation.dematerialized_feasibility_file_createOrUpdateEligibilityRequirement":
    isAdminOrCandidacyCompanion,
};
