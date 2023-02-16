import { isAnyone, isAdmin } from "../security/presets";

export const resolversSecurityMap = {
  "Mutation.createSubscriptionRequest": isAnyone,
  // "Query.*": isAdmin,
};
