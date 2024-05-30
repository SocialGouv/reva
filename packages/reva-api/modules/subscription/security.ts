import { isAdmin, isAnyone } from "../shared/security/presets";

export const resolversSecurityMap = {
  "Mutation.subscription_createSubscriptionRequest": isAnyone,
  "Mutation.subscription_createSubscriptionRequestV2": isAnyone,
  "Mutation.subscription_validateSubscriptionRequest": isAdmin,
  "Mutation.subscription_rejectSubscriptionRequest": isAdmin,
  "Mutation.subscription_validateSubscriptionRequestV2": isAdmin,
  "Mutation.subscription_rejectSubscriptionRequestV2": isAdmin,
  "Query.*": isAdmin,
};
