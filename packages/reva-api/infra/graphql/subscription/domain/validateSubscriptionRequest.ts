import { Either, EitherAsync, Left, Maybe, Right } from "purify-ts";

import { Organism } from "../../../../domain/types/candidacy";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";
import { logger } from "../../../logger";
import { Account } from ".prisma/client";

interface ValidateSubscriptionRequestDeps {
  getSubscriptionRequestById: (
    id: string
  ) => Promise<Either<string, Maybe<SubscriptionRequest>>>;
  deleteSubscriptioRequestById: (id: string) => Promise<Either<string, void>>;
  getOrganismBySiret: (
    siret: string
  ) => Promise<Either<string, Maybe<Organism>>>;
  createOrganism: (
    data: Omit<Organism, "id">
  ) => Promise<Either<string, Organism>>;
  getAccountFromEmail: (
    email: string
  ) => Promise<Either<string, Maybe<Account>>>;
  createAccountInIAM: (params: {
    email: string;
    username: string;
    firstname?: string;
    lastname?: string;
    group: string;
  }) => Promise<Either<string, string>>;
  createAccountProfile: (params: {
    email: string;
    firstname: string;
    lastname: string;
    organismId: string;
    keycloakId: string;
  }) => Promise<Either<string, Account>>;
  // sendEmail: (params: unknown) => Promise<Either<string, void>>;
}

interface ValidateSubscriptionRequestParams {
  subscriptionRequestId: string;
}

export const validateSubscriptionRequest = async (
  deps: ValidateSubscriptionRequestDeps,
  params: ValidateSubscriptionRequestParams
) => {
  const $store: {
    subreq?: SubscriptionRequest;
    organism?: Organism;
    keyCloackId?: string;
  } = {};

  const getSubscriptionRequest = EitherAsync.fromPromise(async () =>
    (await deps.getSubscriptionRequestById(params.subscriptionRequestId))
      .mapLeft(
        (error: string) =>
          new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, error)
      )
      .ifRight((maybeSubReq) => {
        $store.subreq = maybeSubReq.extract();
        if (maybeSubReq.isNothing()) {
          logger.error(
            `La demande d'inscription ${params.subscriptionRequestId} n'existe pas`
          );
        }
        return maybeSubReq.toEither(
          new FunctionalError(
            FunctionalCodeError.SUBSCRIPTION_REQUEST_NOT_FOUND,
            `La demande d'inscription ${params.subscriptionRequestId} n'existe pas`
          )
        );
      })
  );

  const checkIfOrganismExists = EitherAsync.fromPromise(async () => {
    const eitherOrganism = await deps.getOrganismBySiret(
      ($store.subreq as SubscriptionRequest).companySiret
    );
    if (eitherOrganism.isLeft()) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          eitherOrganism.extract()
        )
      );
    }
    const maybeOrganism = eitherOrganism.extract() as Maybe<Organism>;
    if (maybeOrganism.isJust()) {
      const errorMessage = `Un organisme existe déjà avec le siret ${$store.subreq?.companySiret}`;
      logger.error(errorMessage);
      return Left(
        new FunctionalError(
          FunctionalCodeError.ORGANISM_ALREADY_EXISTS,
          errorMessage
        )
      );
    }
    logger.info(
      `[validateSubscriptionRequest] checkIfOrganismExists suceeded, continuing`
    );
    return Right(undefined);
  });

  const checkIfAccountExists = EitherAsync.fromPromise(async () => {
    const eitherAccount = await deps.getAccountFromEmail(
      ($store.subreq as SubscriptionRequest).accountEmail
    );
    if (eitherAccount.isLeft()) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          eitherAccount.extract()
        )
      );
    }
    const maybeAccount = eitherAccount.extract() as Maybe<Account>;
    if (maybeAccount.isJust()) {
      const errorMessage = `Un compte existe déjà avec l'email ${$store.subreq?.accountEmail}`;
      logger.error(errorMessage);
      return Left(
        new FunctionalError(
          FunctionalCodeError.ACCOUNT_ALREADY_EXISTS,
          errorMessage
        )
      );
    }
    logger.info(
      `[validateSubscriptionRequest] checkIfAccountExists suceeded, continuing`
    );
    return Right(undefined);
  });

  const createOrganism = EitherAsync.fromPromise(async () =>
    (
      await deps.createOrganism({
        label: $store.subreq?.companyName ?? "",
        address: $store.subreq?.companyAddress ?? "",
        contactAdministrativeEmail: $store.subreq?.accountEmail ?? "",
        contactCommercialEmail: $store.subreq?.companyBillingEmail ?? "",
        contactCommercialName: `${$store.subreq?.accountLastname} ${$store.subreq?.accountFirstname}`,
        city: "",
        zip: "",
        siret: $store.subreq?.companySiret ?? "",
        isActive: true,
      })
    )
      .mapLeft(
        (error: string) =>
          new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, error)
      )
      .ifRight((organism) => {
        $store.organism = organism;
        logger.info(
          `[validateSubscriptionRequest] Successfuly created organism with siret ${$store.subreq?.companySiret}`
        );
      })
  );

  const createAccount = EitherAsync.fromPromise(async () =>
    (
      await deps.createAccountProfile({
        firstname: $store.subreq?.accountFirstname ?? "",
        lastname: $store.subreq?.accountLastname ?? "",
        email: $store.subreq?.accountEmail ?? "",
        keycloakId: $store.keyCloackId ?? "",
        organismId: $store.organism?.id ?? "",
      })
    )
      .mapLeft(
        (error: string) =>
          new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, error)
      )
      .ifRight(() => {
        logger.info(
          `[validateSubscriptionRequest] Successfuly created AP account with email ${$store.subreq?.accountEmail}`
        );
      })
  );

  const deleteSubscriptionRequest = EitherAsync.fromPromise(async () =>
    (await deps.deleteSubscriptioRequestById(params.subscriptionRequestId))
      .mapLeft(
        (error: string) =>
          new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, error)
      )
      .ifRight(() => {
        logger.info(
          `[validateSubscriptionRequest] Successfuly deleted subscriptionRequest ${$store.subreq?.id}`
        );
      })
  );

  const createKeycloakAccount = EitherAsync.fromPromise(async () =>
    (
      await deps.createAccountInIAM({
        email: $store.subreq?.accountEmail ?? "",
        firstname: $store.subreq?.accountFirstname ?? "",
        lastname: $store.subreq?.accountLastname ?? "",
        username: $store.subreq?.accountEmail ?? "",
        group: "organism",
      })
    )
      .mapLeft(
        (error: string) =>
          new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, error)
      )
      .ifRight((keycloakId) => {
        $store.keyCloackId = keycloakId;
        logger.info(
          `[validateSubscriptionRequest] Successfuly created IAM account with email ${$store.subreq?.accountEmail}`
        );
      })
  );

  // const sendValidationEmail = EitherAsync.fromPromise(async () => (
  //   //
  // ));

  return (
    getSubscriptionRequest
      .chain(() => checkIfOrganismExists)
      .chain(() => checkIfAccountExists)
      // .chain(() => checkIfKeycloakAccountExists)
      .chain(() => createOrganism)
      .chain(() => createKeycloakAccount)
      .chain(() => createAccount)
      // .chain(() => sendValidationEmail)
      .chain(() => deleteSubscriptionRequest)
  );
};
