import {
  defaultSecurity,
  isAdminOrCandidacyCompanion,
  isAnyone,
  isOwnerOfCandidate,
} from "../../shared/security/presets";

export const resolversSecurityMap = {
  "Mutation.*": defaultSecurity, // forbidden

  "Mutation.candidate_askForRegistration": isAnyone,
  "Mutation.candidate_login": isAnyone,
  "Mutation.candidate_askForLogin": isAnyone,
  "Mutation.candidate_updateCandidateInformation": isAdminOrCandidacyCompanion,
  "Mutation.candidate_updateCandidateProfile": isAdminOrCandidacyCompanion,
  "Mutation.candidate_updateCandidateInformationBySelf": isOwnerOfCandidate,
};
