import { defaultSecurity } from "../../shared/security/presets";

export const resolversSecurityMap = {
  "Query.*": defaultSecurity,
  "Mutation.*": defaultSecurity,
};
