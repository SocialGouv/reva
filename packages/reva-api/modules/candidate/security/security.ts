import {
  defaultSecurity,
  isAdminOrCandidacyCompanion,
  isAnyone,
} from "../../shared/security/presets";

export const resolversSecurityMap = {
  "Mutation.*": defaultSecurity, // forbidden

  "Mutation.candidate_askForRegistration": isAnyone,
  "Mutation.candidate_login": isAnyone,
  "Mutation.candidate_askForLogin": isAnyone,
  "Mutation.candidate_updateCandidateCivilInformation":
    isAdminOrCandidacyCompanion,
  "Mutation.candidate_updateCandidateContactInformation":
    isAdminOrCandidacyCompanion,
  "Mutation.candidate_updateCandidateProfile": isAdminOrCandidacyCompanion,
};
