import {
  hasRole,
  isCandidacyOwner,
  whenHasRole,
} from "../../shared/security/middlewares";
import { defaultSecurity, isAnyone } from "../../shared/security/presets";
import { isCandidateOwnerOfCandidacy } from "../security/isCandidateOwnerOfCandidacy.security";

export const resolversSecurityMap = {
  "Query.*": isAnyone,

  "Mutation.*": defaultSecurity,
  "Mutation.training_confirmTrainingForm": [
    hasRole(["admin", "manage_candidacy", "candidate"]),
    whenHasRole("manage_candidacy", isCandidacyOwner),
    whenHasRole("candidate", isCandidateOwnerOfCandidacy),
  ],
  "Mutation.training_submitTrainingForm": [
    hasRole(["admin", "manage_candidacy", "candidate"]),
    whenHasRole("manage_candidacy", isCandidacyOwner),
    whenHasRole("candidate", isCandidateOwnerOfCandidacy),
  ],
};
