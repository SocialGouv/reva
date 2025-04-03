import { defaultSecurity, isAnyone } from "../shared/security/presets";

export const vaeCollectiveResolversSecurityMap = {
  "Mutation.*": defaultSecurity,

  // Define specific resolver security rules
  "Query.getCohorteVAECollectiveByCodeInscription": isAnyone,
};
