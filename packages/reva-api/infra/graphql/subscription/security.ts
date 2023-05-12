import { isAdmin, isAnyone } from "../security/presets";

export const resolversSecurityMap = {
  "Mutation.subscription_createSubscriptionRequest": isAnyone,
  "Mutation.subscription_validateSubscriptionRequest": isAdmin,
  "Mutation.subscription_rejectSubscriptionRequest": isAdmin,
  "Query.*": isAdmin,
};
