import {
  defaultSecurity,
  isAdminOrCandidacyCompanion,
  isAdminOrOwnerOfCandidacy,
  isAnyone,
} from "@/modules/shared/security/presets";

export const resolversSecurityMap = {
  "Query.*": isAnyone,

  "Mutation.*": defaultSecurity,

  "Mutation.candidacy_certification_updateCertification":
    isAdminOrOwnerOfCandidacy,

  "Mutation.candidacy_certification_updateCertificationWithinOrganismScope":
    isAdminOrCandidacyCompanion,
};
