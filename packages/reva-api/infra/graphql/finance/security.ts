import {
    isAdminOrOwningManager,
  } from "../security/presets";
  
  export const resolversSecurityMap = {
    // Mutations manager ou admin
    "Mutation.candidacy_createOrUpdatePaymentRequest": isAdminOrOwningManager,
  };
  