import { Either, Left, Right } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";
import { prismaClient } from "../../../database/postgres/client";
import { logger } from "../../../logger";

export const createSubscriptionRequest = async (
  subscriptionRequestInput: any
) : Promise<Either<string,any>>=> {
  try {
    const subscriptionRequest = await prismaClient.subscriptionRequest.create({
      data: {
        companyName: subscriptionRequestInput.companyName,
        companyLegalStatus: subscriptionRequestInput.companyLegalStatus,
        companySiret: subscriptionRequestInput.companySiret,
        companyAddress: subscriptionRequestInput.companyAddress,
        companyBillingAddress: subscriptionRequestInput.companyBillingAddress,
        companyBillingEmail: subscriptionRequestInput.companyBillingEmail,
        companyBIC: subscriptionRequestInput.companyBic,
        companyIBAN: subscriptionRequestInput.companyIban,
        accountFirstname: subscriptionRequestInput.accountFirstname,
        accountLastname: subscriptionRequestInput.accountLastname,
        accountEmail: subscriptionRequestInput.accountEmail,
        accountPhoneNumber: subscriptionRequestInput.accountPhoneNumber,
      },
    });
    return Right(subscriptionRequest);
  } catch (e: any) {
    logger.error(e);
    return Left("La création de demande d'inscription a échoué");
  }
};
