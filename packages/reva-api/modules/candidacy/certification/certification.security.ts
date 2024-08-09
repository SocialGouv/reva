import {
  defaultSecurity,
  isAdminOrCandidacyCompanion,
  isAnyone,
  isOwnerOfCandidacy,
} from "../../shared/security/presets";

export const resolversSecurityMap = {
  "Query.*": isAnyone,

  "Mutation.*": defaultSecurity,

  "Mutation.candidacy_certification_updateCertification": isOwnerOfCandidacy,

  "Mutation.candidacy_certification_updateCertificationWithinOrganismScope":
    isAdminOrCandidacyCompanion,
};
