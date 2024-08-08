import {
  defaultSecurity,
  isAdminOrCandidacyCompanion,
  isAnyone,
  isOwnerOfCandidacy,
} from "../shared/security/presets";

export const resolversSecurityMap = {
  "Query.*": isAnyone,

  "Mutation.*": defaultSecurity,

  "Mutation.certification_updateCertification": isOwnerOfCandidacy,

  "Mutation.certification_updateCertificationWithinOrganismScope":
    isAdminOrCandidacyCompanion,
};
