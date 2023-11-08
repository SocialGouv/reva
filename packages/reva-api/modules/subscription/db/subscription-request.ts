import { Either, Left, Maybe, Right } from "purify-ts";

import { prismaClient } from "../../../prisma/client";
import { logger } from "../../shared/logger";

const withoutNullFields = (obj: Record<string, unknown>) => {
  return Object.getOwnPropertyNames(obj).reduce((newObj, propName) => {
    return obj[propName] === null
      ? newObj
      : Object.assign(newObj, { [propName]: obj[propName] });
  }, {});
};

const departmentsWithOrganismMethods = ({
  onSite,
  remote,
}: {
  onSite: string[];
  remote: string[];
}) =>
  [...new Set([...onSite, ...remote])].map((departmentId) => ({
    departmentId,
    isOnSite: onSite.includes(departmentId),
    isRemote: remote.includes(departmentId),
  }));

export const createSubscriptionRequest = async (
  subscriptionRequestInput: SubscriptionRequestInput
): Promise<Either<string, SubscriptionRequest>> => {
  try {
    const subscriptionRequest = await prismaClient.subscriptionRequest.create({
      data: {
        companySiret: subscriptionRequestInput.companySiret,
        companyLegalStatus: subscriptionRequestInput.companyLegalStatus,
        companyName: subscriptionRequestInput.companyName,
        companyAddress: subscriptionRequestInput.companyAddress,
        companyZipCode: subscriptionRequestInput.companyZipCode,
        companyCity: subscriptionRequestInput.companyCity,
        accountFirstname: subscriptionRequestInput.accountFirstname,
        accountLastname: subscriptionRequestInput.accountLastname,
        accountEmail: subscriptionRequestInput.accountEmail,
        accountPhoneNumber: subscriptionRequestInput.accountPhoneNumber,
        typology: subscriptionRequestInput.typology,
        companyWebsite: subscriptionRequestInput.companyWebsite,
        subscriptionRequestOnDomaine: {
          createMany: {
            data:
              subscriptionRequestInput.domaineIds?.map((domaineId) => ({
                domaineId,
              })) || [],
          },
        },
        subscriptionRequestOnConventionCollective: {
          createMany: {
            data:
              subscriptionRequestInput.ccnIds?.map((ccnId) => ({
                ccnId,
              })) || [],
          },
        },
        departmentsWithOrganismMethods: {
          createMany: {
            data: departmentsWithOrganismMethods({
              onSite: subscriptionRequestInput.onSiteDepartmentsIds,
              remote: subscriptionRequestInput.remoteDepartmentsIds,
            }),
          },
        },
        qualiopiCertificateExpiresAt:
          subscriptionRequestInput.qualiopiCertificateExpiresAt,
      },
    });
    return Right(withoutNullFields(subscriptionRequest) as SubscriptionRequest);
  } catch (e) {
    logger.error(e);
    return Left("La création de demande d'inscription a échoué");
  }
};

export const getSubscriptionRequestById = async (
  id: string
): Promise<Either<string, Maybe<SubscriptionRequest>>> => {
  try {
    const subreq = await prismaClient.subscriptionRequest.findUnique({
      where: { id },
      include: {
        subscriptionRequestOnDomaine: { include: { domaine: true } },
        subscriptionRequestOnConventionCollective: {
          include: { ccn: true },
        },
        departmentsWithOrganismMethods: {
          include: { department: true },
        },
      },
    });
    return Right(
      Maybe.fromNullable(subreq).map(
        (subreq) => withoutNullFields(subreq) as SubscriptionRequest
      )
    );
  } catch (e) {
    logger.error(e);
    return Left("La récupération de la demande d'inscription a échoué");
  }
};

export const deleteSubscriptionRequestById = async (
  id: string
): Promise<Either<string, void>> => {
  try {
    await prismaClient.subscriptionRequest.update({
      where: { id },
      data: {
        subscriptionRequestOnDomaine: { deleteMany: {} },
        subscriptionRequestOnConventionCollective: { deleteMany: {} },
      },
    });
    await prismaClient.subscriptionRequest.delete({
      where: { id },
    });
    return Right(undefined);
  } catch (e) {
    logger.error(e);
    return Left("La suppression de la demande d'inscription a échoué");
  }
};

export const rejectSubscriptionRequestById = async (
  id: string,
  reason: string
): Promise<Either<string, SubscriptionRequest>> => {
  try {
    return Right(
      await prismaClient.subscriptionRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectionReason: reason,
        },
      })
    );
  } catch (e) {
    logger.error(e);
    return Left("La suppression de la demande d'inscription a échoué");
  }
};

export const existSubscriptionRequestWithTypologyAndSiret = async ({
  typology,
  companySiret,
}: Pick<SubscriptionRequestInput, "companySiret" | "typology">) => {
  try {
    const matchCount = await prismaClient.subscriptionRequest.count({
      where: {
        companySiret,
        typology: typology as OrganismTypology,
        status: "PENDING",
      },
    });
    return Right(matchCount > 0);
  } catch (e) {
    logger.error(e);
    return Left(`Error while counting subscription requests matching criteria`);
  }
};
