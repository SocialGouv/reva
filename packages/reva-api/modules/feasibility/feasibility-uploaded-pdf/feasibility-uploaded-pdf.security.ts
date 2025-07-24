import { defaultSecurity } from "@/modules/shared/security/presets";

export const resolversSecurityMap = {
  "Query.*": defaultSecurity,
  "Mutation.*": defaultSecurity,
};
