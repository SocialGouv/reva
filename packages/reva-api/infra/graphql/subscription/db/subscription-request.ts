import { Either, Left, Right } from "purify-ts";

import { prismaClient } from "../../../database/postgres/client";
import { logger } from "../../../logger";

export const createSubscriptionRequest = async (
  subscriptionRequestInput: any
): Promise<Either<string, any>> => {
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

export const getSubscriptionRequests = async (): Promise<
  Either<string, any[]>
> => {
  try {
    const subscriptionRequests =
      await prismaClient.subscriptionRequest.findMany({
        select: {
          id: true,
          accountLastname: true,
          accountFirstname: true,
          accountEmail: true,
          companyName: true,
          companyAddress: true,
        },
      });
    return Right(subscriptionRequests);
  } catch (e: any) {
    logger.error(e);
    return Left("La récupération des demandes d'inscription a échoué");
  }
};
