import { randomUUID } from "crypto";

import KeycloakAdminClient from "@keycloak/keycloak-admin-client";

import {
  createAccountProfile,
  getAccountFromEmail,
} from "../../account/database/accounts";
import * as IAM from "../../account/features/keycloak";
import {
  createOrganism,
  getOrganismBySiretAndTypology,
} from "../../organism/database/organisms";
import { assignMaisonMereAAPToOrganism } from "../../organism/features/assignMaisonMereAAPToOrganism";
import { createMaisonMereAAP } from "../../organism/features/createMaisonMereAAP";
import { Organism } from "../../organism/organism.types";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import { logger } from "../../shared/logger";
import {
  deleteSubscriptionRequestById,
  getSubscriptionRequestById,
} from "../db/subscription-request";
import { __TEST_IAM_FAIL_CHECK__, __TEST_IAM_PASS_CHECK__ } from "./test-const";

interface ValidateSubscriptionRequestParams {
  subscriptionRequestId: string;
  keycloakAdmin: KeycloakAdminClient;
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
  params: ValidateSubscriptionRequestParams
) => {
  const $store: {
    subreq?: SubscriptionRequestWithTypologyAssociations;
    organism?: Organism;
    keyCloackId?: string;
  } = {};

  const getIamAccount = IAM.getAccount(params.keycloakAdmin);
  const createAccountInIAM = IAM.createAccount(params.keycloakAdmin);

  try {
    //subscription request check
    const subscriptionRequest = (
      await getSubscriptionRequestById(params.subscriptionRequestId)
    )
      .unsafeCoerce()
      .extractNullable() as SubscriptionRequestWithTypologyAssociations | null;

    if (subscriptionRequest == null) {
      const errorMessage = `La demande d'inscription ${params.subscriptionRequestId} n'existe pas`;
      logger.error(`[validateSubscriptionRequestDeps] ${errorMessage}`);
      throw new FunctionalError(
        FunctionalCodeError.SUBSCRIPTION_REQUEST_NOT_FOUND,
        errorMessage
      );
    }
    $store.subreq = subscriptionRequest;

    //organism check
    const oldOrganism = (
      await getOrganismBySiretAndTypology(
        ($store.subreq as SubscriptionRequest).companySiret,
        ($store.subreq as SubscriptionRequest).typology
      )
    )
      .unsafeCoerce()
      .extractNullable();

    if (oldOrganism) {
      throw new FunctionalError(
        FunctionalCodeError.ORGANISM_ALREADY_EXISTS,
        `Un organisme existe déjà avec le siret ${$store.subreq?.companySiret} pour la typologie ${$store.subreq?.typology}`
      );
    }

    //account check
    const oldAccount = (
      await getAccountFromEmail(
        ($store.subreq as SubscriptionRequest).accountEmail
      )
    )
      .unsafeCoerce()
      .extractNullable();

    if (oldAccount) {
      throw new FunctionalError(
        FunctionalCodeError.ACCOUNT_ALREADY_EXISTS,
        `Un compte existe déjà avec l'email ${$store.subreq?.accountEmail}`
      );
    }

    //iam account check
    if (
      ($store.subreq as SubscriptionRequest).accountEmail ===
      __TEST_IAM_FAIL_CHECK__
    ) {
      throw new FunctionalError(
        FunctionalCodeError.ACCOUNT_IN_IAM_ALREADY_EXISTS,
        "TEST : le compte IAM existe déjà"
      );
    }
    if (
      ($store.subreq as SubscriptionRequest).accountEmail !==
      __TEST_IAM_PASS_CHECK__
    ) {
      const oldIamAccount = (
        await getIamAccount({
          email: ($store.subreq as SubscriptionRequest).accountEmail,
          username: "",
        })
      )
        .unsafeCoerce()
        .extractNullable();

      if (oldIamAccount)
        throw new FunctionalError(
          FunctionalCodeError.ACCOUNT_IN_IAM_ALREADY_EXISTS,
          `Un compte IAM existe déjà avec l'email ${$store.subreq?.accountEmail}`
        );
    }

    //organism creation
    const newOrganism = (
      await createOrganism({
        label: $store.subreq?.companyName ?? "",
        address: $store.subreq?.companyAddress ?? "",
        contactAdministrativeEmail: $store.subreq?.accountEmail ?? "",
        contactAdministrativePhone: $store.subreq.accountPhoneNumber ?? "",
        website: $store.subreq?.companyWebsite,
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
    ).unsafeCoerce();

    $store.organism = newOrganism || undefined;
    logger.info(
      `[validateSubscriptionRequest] Successfuly created organism with siret ${$store.subreq?.companySiret}`
    );

    //iam account creation
    const newKeycloakId =
      $store.subreq?.accountEmail === __TEST_IAM_PASS_CHECK__
        ? randomUUID()
        : (
            await createAccountInIAM({
              email: $store.subreq?.accountEmail ?? "",
              firstname: $store.subreq?.accountFirstname ?? "",
              lastname: $store.subreq?.accountLastname ?? "",
              username: $store.subreq?.accountEmail ?? "",
              group: "organism",
            })
          ).unsafeCoerce();

    $store.keyCloackId = newKeycloakId;

    logger.info(
      `[validateSubscriptionRequest] Successfuly created IAM account ${newKeycloakId}`
    );

    //db account creation
    const account = (
      await createAccountProfile({
        firstname: $store.subreq?.accountFirstname ?? "",
        lastname: $store.subreq?.accountLastname ?? "",
        email: $store.subreq?.accountEmail ?? "",
        keycloakId: $store.keyCloackId ?? "",
        organismId: $store.organism?.id ?? "",
      })
    ).unsafeCoerce();

    logger.info(
      `[validateSubscriptionRequest] Successfuly created AP with organismId ${$store.subreq?.organismId}`
    );

    const newMaisonMereAAP = await createMaisonMereAAP({
      maisonMereAAP: {
        raisonSociale: $store.subreq?.companyName ?? "",
        adresse: $store.subreq?.companyAddress ?? "",
        siteWeb: $store.subreq?.companyWebsite,
        ville: $store.subreq?.companyCity ?? "",
        codePostal: $store.subreq?.companyZipCode ?? "",
        siret: $store.subreq?.companySiret ?? "",
        statutJuridique: $store.subreq?.companyLegalStatus,
        typologie: $store.subreq?.typology ?? "generaliste",
        dateExpirationCertificationQualiopi:
          $store.subreq?.qualiopiCertificateExpiresAt,
        gestionnaireAccountId: account.id,
      },
      domaineIds: $store.subreq?.subscriptionRequestOnDomaine?.map(
        (o: { domaineId: string }) => o.domaineId
      ),
      ccnIds: $store.subreq?.subscriptionRequestOnConventionCollective?.map(
        (o: { ccnId: string }) => o.ccnId
      ),
      maisonMereAAPOnDepartements:
        $store.subreq?.departmentsWithOrganismMethods?.map(
          (d: {
            departmentId: string;
            isOnSite: boolean;
            isRemote: boolean;
          }) => ({
            departementId: d.departmentId,
            estSurPlace: d.isOnSite,
            estADistance: d.isRemote,
          })
        ) ?? [],
    });

    await assignMaisonMereAAPToOrganism({
      organismId: newOrganism.id,
      maisonMereAAPId: newMaisonMereAAP.id,
    });

    // subscription request deletion
    (
      await deleteSubscriptionRequestById(params.subscriptionRequestId)
    ).unsafeCoerce();

    logger.info(
      `[validateSubscriptionRequest] Successfuly deleted subscriptionRequest ${$store.subreq?.id}`
    );

    return "Ok";
  } catch (e) {
    if (e instanceof FunctionalError) {
      throw e;
    } else {
      logger.error(e);
      throw new FunctionalError(
        FunctionalCodeError.TECHNICAL_ERROR,
        "Erreur pendant la validation de la demande d'inscription"
      );
    }
  }
};
