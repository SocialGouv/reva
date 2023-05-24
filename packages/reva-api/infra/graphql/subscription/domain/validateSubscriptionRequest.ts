import { randomUUID } from "crypto";

import { Either, EitherAsync, Left, Maybe, Right } from "purify-ts";

import {
  DepartmentWithOrganismMethods,
  Organism,
} from "../../../../domain/types/candidacy";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";
import { logger } from "../../../logger";
import { __TEST_IAM_FAIL_CHECK__, __TEST_IAM_PASS_CHECK__ } from "./test-const";
import { Account } from ".prisma/client";

interface ValidateSubscriptionRequestDeps {
  getSubscriptionRequestById: (
    id: string
  ) => Promise<Either<string, Maybe<SubscriptionRequest>>>;
  deleteSubscriptionRequestById: (id: string) => Promise<Either<string, void>>;
  getOrganismBySiretAndTypology: (
    siret: string,
    typology: OrganismTypology
  ) => Promise<Either<string, Maybe<Organism>>>;
  createOrganism: (
    data: Omit<Organism, "id"> & {
      ccnIds?: string[];
      domaineIds?: string[];
      departmentsWithOrganismMethods: DepartmentWithOrganismMethods[];
    }
  ) => Promise<Either<string, Organism>>;
  getIamAccount: (params: {
    email: string;
    username: string;
  }) => Promise<Either<string, Maybe<any>>>;
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
  sendConfirmationEmail: (
    email: string,
    iamLinkUrl?: string
  ) => Promise<Either<string, string>>;
}

interface ValidateSubscriptionRequestParams {
  subscriptionRequestId: string;
}

type SubscriptionRequestWithTypologyAssociations = SubscriptionRequest & {
  subscriptionRequestOnDomaine?: { domaineId: string }[];
  subscriptionRequestOnConventionCollective?: { ccnId: string }[];
  departmentsWithOrganismMethods?: {
    departmentId: string;
    isOnSite: boolean;
    isRemote: boolean;
  }[];
};

export const validateSubscriptionRequest = async (
  deps: ValidateSubscriptionRequestDeps,
  params: ValidateSubscriptionRequestParams
) => {
  const $store: {
    subreq?: SubscriptionRequestWithTypologyAssociations;
    organism?: Organism;
    keyCloackId?: string;
  } = {};

  const getSubscriptionRequest = EitherAsync.fromPromise(async () => {
    const eitherSubreq = await deps.getSubscriptionRequestById(
      params.subscriptionRequestId
    );
    if (eitherSubreq.isLeft()) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          eitherSubreq.extract()
        )
      );
    }
    const maybeSubReq =
      eitherSubreq.extract() as Maybe<SubscriptionRequestWithTypologyAssociations>;
    if (maybeSubReq.isNothing()) {
      const errorMessage = `La demande d'inscription ${params.subscriptionRequestId} n'existe pas`;
      logger.error(`[validateSubscriptionRequestDeps] ${errorMessage}`);
      return Left(
        new FunctionalError(
          FunctionalCodeError.SUBSCRIPTION_REQUEST_NOT_FOUND,
          errorMessage
        )
      );
    }
    const subreq =
      maybeSubReq.extract() as SubscriptionRequestWithTypologyAssociations;
    $store.subreq = subreq;

    return Right(subreq);
  });

  const checkIfOrganismExists = EitherAsync.fromPromise(async () => {
    const eitherOrganism = await deps.getOrganismBySiretAndTypology(
      ($store.subreq as SubscriptionRequest).companySiret,
      ($store.subreq as SubscriptionRequest).typology,
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
      const errorMessage = `Un organisme existe déjà avec le siret ${$store.subreq?.companySiret} pour la typologie ${$store.subreq?.typology}`;
      logger.error(`[validateSubscriptionRequest] ${errorMessage}`);
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
      logger.error(`[validateSubscriptionRequest] ${errorMessage}`);
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

  const checkIfKeycloakAccountExists = EitherAsync.fromPromise(async () => {
    if (
      ($store.subreq as SubscriptionRequest).accountEmail ===
      __TEST_IAM_FAIL_CHECK__
    ) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.ACCOUNT_IN_IAM_ALREADY_EXISTS,
          "TEST : le compte IAM existe déjà"
        )
      );
    }
    if (
      ($store.subreq as SubscriptionRequest).accountEmail ===
      __TEST_IAM_PASS_CHECK__
    ) {
      return Right(undefined);
    }

    const eitherAccount = await deps.getIamAccount({
      email: ($store.subreq as SubscriptionRequest).accountEmail,
      username: "",
    });
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
      const errorMessage = `Un compte IAM existe déjà avec l'email ${$store.subreq?.accountEmail}`;
      logger.error(`[validateSubscriptionRequest] ${errorMessage}`);
      return Left(
        new FunctionalError(
          FunctionalCodeError.ACCOUNT_IN_IAM_ALREADY_EXISTS,
          errorMessage
        )
      );
    }
    logger.info(
      `[validateSubscriptionRequest] checkIfKeycloakAccountExists suceeded, continuing`
    );
    return Right(undefined);
  });

  const createOrganism = EitherAsync.fromPromise(async () =>
    (
      await deps.createOrganism({
        label: $store.subreq?.companyName ?? "",
        address: $store.subreq?.companyAddress ?? "",
        contactAdministrativeEmail: $store.subreq?.accountEmail ?? "",
        city: $store.subreq?.companyCity ?? "",
        zip: $store.subreq?.companyZipCode ?? "",
        siret: $store.subreq?.companySiret ?? "",
        legalStatus: $store.subreq?.companyLegalStatus,
        isActive: true,
        typology: $store.subreq?.typology ?? "generaliste",
        domaineIds: $store.subreq?.subscriptionRequestOnDomaine?.map(
          (o: any) => o.domaineId
        ),
        ccnIds: $store.subreq?.subscriptionRequestOnConventionCollective?.map(
          (o: any) => o.ccnId
        ),
        departmentsWithOrganismMethods:
          $store.subreq?.departmentsWithOrganismMethods ?? [],
        qualiopiCertificateExpiresAt:
          $store.subreq?.qualiopiCertificateExpiresAt,
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
    (await deps.deleteSubscriptionRequestById(params.subscriptionRequestId))
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
    ($store.subreq?.accountEmail === __TEST_IAM_PASS_CHECK__
      ? Right(randomUUID())
      : await deps.createAccountInIAM({
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

  const sendValidationEmail = EitherAsync.fromPromise(() =>
    deps.sendConfirmationEmail($store.subreq?.accountEmail ?? "")
  )
    .mapLeft(
      (error: string) =>
        new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, error)
    )
    .ifRight(() => {
      logger.info(
        `[validateSubscriptionRequestDeps] Successfuly sent registration mail to ${$store.subreq?.accountEmail}`
      );
    });

  return getSubscriptionRequest
    .chain(() => checkIfOrganismExists)
    .chain(() => checkIfAccountExists)
    .chain(() => checkIfKeycloakAccountExists)
    .chain(() => createOrganism)
    .chain(() => createKeycloakAccount)
    .chain(() => createAccount)
    .chain(() => sendValidationEmail)
    .chain(() => deleteSubscriptionRequest);
};
