import {
  defaultSecurity,
  isAnyone,
  isOwnerOrCanManageCandidacy,
} from "../../shared/security/presets";

export const resolversSecurityMap = {
  "Query.*": isAnyone,

  "Mutation.*": defaultSecurity,
  "Mutation.training_confirmTrainingForm": isOwnerOrCanManageCandidacy,
  "Mutation.training_submitTrainingForm": isOwnerOrCanManageCandidacy,
};
