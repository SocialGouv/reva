import { isAnyone, isAdmin } from "../security/presets";

export const resolversSecurityMap = {};
// {
//   "Mutation.subscription_createSubscriptionRequest": isAnyone,
//   "Mutation.subscription_validateSubscription": isAdmin,
//   "Mutation.subscription_rejectSubscription": isAdmin,
//   "Query.*": isAdmin,
// };
