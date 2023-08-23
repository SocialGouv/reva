import { Prisma } from "@prisma/client";
import { Either, EitherAsync, Left, Right } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";

interface createSubscriptionRequestDeps {
  createSubscriptionRequest: (
    params: SubscriptionRequestInput
  ) => Promise<Either<string, SubscriptionRequest>>;
  existSubscriptionRequestWithTypologyAndSiret: (
    params: Pick<SubscriptionRequestInput, "companySiret" | "typology">
  ) => Promise<Either<string, boolean>>;
  existOrganismWithTypologyAndSiret: (
    params: Pick<Prisma.OrganismWhereInput, "siret" | "typology">
  ) => Promise<Either<string, boolean>>;
  sendSubscriptionValidationInProgressEmail: ({
    email,
  }: {
    email: string;
  }) => Promise<Either<string, string>>;
}

export const createSubscriptionRequest = async (
  deps: createSubscriptionRequestDeps,
  params: SubscriptionRequestInput
) => {
  const checkMatchingSubscriptionRequest = () =>
    EitherAsync.fromPromise(async () => {
      const eitherHasMatchingSubReq =
        await deps.existSubscriptionRequestWithTypologyAndSiret({
          companySiret: params.companySiret,
          typology: params.typology,
        });
      if (eitherHasMatchingSubReq.isLeft()) {
        return Left(
          new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            eitherHasMatchingSubReq.extract() as string
          )
        );
      }
      const hasMatchingSubReq = eitherHasMatchingSubReq.extract() as boolean;
      return hasMatchingSubReq
        ? Left(
            new FunctionalError(
              FunctionalCodeError.SUBSCRIPTION_REQUEST_ALREADY_EXISTS,
              `Une demande existe déjà pour ce Siret en tant que "${params.typology}"`
            )
          )
        : Right(true);
    });

  const checkMatchingOrganism = () =>
    EitherAsync.fromPromise(async () => {
      const eitherHasMatchingOrganism =
        await deps.existOrganismWithTypologyAndSiret({
          siret: params.companySiret,
          typology: params.typology,
        });
      if (eitherHasMatchingOrganism.isLeft()) {
        return Left(
          new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            eitherHasMatchingOrganism.extract() as string
          )
        );
      }
      const hasMatchingOrganism =
        eitherHasMatchingOrganism.extract() as boolean;
      return hasMatchingOrganism
        ? Left(
            new FunctionalError(
              FunctionalCodeError.SUBSCRIPTION_REQUEST_HAS_MATCHING_ORGANISM,
              `Un organisme existe déjà avec ce Siret en tant que "${params.typology}"`
            )
          )
        : Right(true);
    });

  const createSubscriptionRequest = () =>
    EitherAsync.fromPromise(async () => {
      const result = await deps.createSubscriptionRequest(params);
      if (result.isRight()) {
        await deps.sendSubscriptionValidationInProgressEmail({
          email: params.accountEmail,
        });
      }
      return result;
    }).mapLeft(
      (err: string) =>
        new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, err)
    );

  return checkMatchingSubscriptionRequest()
    .chain(checkMatchingOrganism)
    .chain(createSubscriptionRequest);
};
