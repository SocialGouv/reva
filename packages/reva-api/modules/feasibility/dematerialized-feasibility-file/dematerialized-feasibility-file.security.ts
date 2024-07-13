import { isCandidateOwnerOfCandidacy } from "../../candidacy/security/isCandidateOwnerOfCandidacy.security";
import {
  hasRole,
  isCandidacyOwner,
  whenHasRole,
} from "../../shared/security/middlewares";
import {
  defaultSecurity,
  isAdminOrCandidacyCompanion,
} from "../../shared/security/presets";

export const resolversSecurityMap = {
  // Sécurité par défaut
  // cf https://the-guild.dev/graphql/tools/docs/resolvers-composition#supported-path-matcher-format
  "Query.*": defaultSecurity,

  "Query.dematerialized_feasibility_file_getByCandidacyId":
    isAdminOrCandidacyCompanion,

  "Mutation.*": defaultSecurity,

  "Mutation.dematerialized_feasibility_file_createOrUpdateCertificationInfo":
    isAdminOrCandidacyCompanion,
  "Mutation.dematerialized_feasibility_file_createOrupdateCertificationCompetenceDetails":
    isAdminOrCandidacyCompanion,
  "Mutation.dematerialized_feasibility_file_createOrUpdatePrerequisites":
    isAdminOrCandidacyCompanion,
  "Mutation.dematerialized_feasibility_file_createOrUpdateDecision":
    isAdminOrCandidacyCompanion,
  "Mutation.dematerialized_feasibility_file_createOrUpdateAttachments":
    isAdminOrCandidacyCompanion,
  "Mutation.dematerialized_feasibility_file_sendToCandidate":
    isAdminOrCandidacyCompanion,
  "Mutation.dematerialized_feasibility_file_sendToCertificationAuthority":
    isAdminOrCandidacyCompanion,
  "Mutation.dematerialized_feasibility_file_createOrUpdateSwornStatement": [
    hasRole(["admin", "manage_candidacy", "candidate"]),
    whenHasRole("manage_candidacy", isCandidacyOwner),
    whenHasRole("candidate", isCandidateOwnerOfCandidacy),
  ],
};
