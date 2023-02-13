import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { LegalStatus } from "@prisma/client";
import mercurius from "mercurius";

import * as db from "./db/subscription-request";
import * as domain from "./domain/index";
import { resolversSecurityMap } from "./security";

const unsafeResolvers = {
  Mutation: {
    createSubscriptionRequest: async (
      _: unknown,
      payload: {
        subscriptionRequest: {
          companyName: string;
          companyLegalStatus: LegalStatus;
          companySiret: string;
          companyAddress: string;
          companyBillingAddress: string;
          companyBillingEmail: string;
          companyBic: string;
          companyIban: string;
          accountFirstname: string;
          accountLastname: string;
          accountEmail: string;
          accountPhoneNumber: string;
        }
      }
    ) => {
      const result = await domain.createSubscriptionRequest(
        { createSubscriptionRequest: db.createSubscriptionRequest },
        payload.subscriptionRequest
      );
      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
  },
  // Query: {},
};

export const subscriptionRequestResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap
);
