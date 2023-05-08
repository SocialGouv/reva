import { Either, Left, Maybe, Right } from "purify-ts";

import { prismaClient } from "../../../database/postgres/client";
import { logger } from "../../../logger";
import { Prisma } from ".prisma/client";

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
        companyBillingContactFirstname:
          subscriptionRequestInput.companyBillingContactFirstname,
        companyBillingContactLastname:
          subscriptionRequestInput.companyBillingContactLastname,
        companyBillingEmail: subscriptionRequestInput.companyBillingEmail,
        companyBillingPhoneNumber:
          subscriptionRequestInput.companyBillingPhoneNumber,
        companyBic: subscriptionRequestInput.companyBic,
        companyIban: subscriptionRequestInput.companyIban,
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

export const getSubscriptionRequestsCount = async (
  params: GetSubscriptionRequestsParams
): Promise<Either<string, number>> => {
  try {
    const numSubReq = await prismaClient.subscriptionRequest.count(
      filterClause(params)
    );
    return Right(numSubReq);
  } catch (e) {
    logger.error(e);
    return Left("La récupération des demandes d'inscription a échoué");
  }
};

export const getSubscriptionRequests = async (
  params: GetSubscriptionRequestsParams
): Promise<Either<string, SubscriptionRequestSummary[]>> => {
  try {
    const subscriptionRequests =
      await prismaClient.subscriptionRequest.findMany(
        Object.assign(
          {
            select: {
              id: true,
              accountLastname: true,
              accountFirstname: true,
              accountEmail: true,
              companyName: true,
              companyAddress: true,
              createdAt: true,
            },
          },
          filterClause(params),
          sortClause(params),
          paginationClause(params)
        )
      );
    return Right(
      subscriptionRequests.map(withoutNullFields) as SubscriptionRequest[]
    );
  } catch (e) {
    logger.error(e);
    return Left("La récupération des demandes d'inscription a échoué");
  }
};

const filterClause = (params: GetSubscriptionRequestsParams) => {
  if (params.filter) {
    return {
      where: {
        accountLastname: {
          contains: params.filter as string,
          mode: Prisma.QueryMode.insensitive,
        },
      },
    };
  }
};

interface PaginationParams {
  limit?: number;
  offset?: number;
}

const paginationClause = (params: PaginationParams) => {
  const clause: { take?: number; skip?: number } = {};
  if (params.limit) {
    clause.take = params.limit;
  }
  if (params.offset) {
    clause.skip = params.offset;
  }
  return clause;
};

const sortClause = (params: GetSubscriptionRequestsParams) => {
  if (params.orderBy) {
    return {
      orderBy: [
        ...Object.entries(params.orderBy).map(([column, value]) => ({
          [column]: value,
        })),
      ],
    };
  }
};
