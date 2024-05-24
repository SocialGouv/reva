import { randomUUID } from "crypto";

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
import { prismaClient } from "../../../prisma/client";

interface ValidateSubscriptionRequestParams {
  subscriptionRequestId: string;
}

export const validateSubscriptionRequest = async (
  params: ValidateSubscriptionRequestParams,
) => {
  const getIamAccount = IAM.getAccount;
  const createAccountInIAM = IAM.createAccount;

  try {
    //subscription request check
    const subscriptionRequest = (
      await getSubscriptionRequestById(params.subscriptionRequestId)
    )
      .unsafeCoerce()
      .extractNullable();

    if (subscriptionRequest == null) {
      const errorMessage = `La demande d'inscription ${params.subscriptionRequestId} n'existe pas`;
      logger.error(`[validateSubscriptionRequestDeps] ${errorMessage}`);
      throw new FunctionalError(
        FunctionalCodeError.SUBSCRIPTION_REQUEST_NOT_FOUND,
        errorMessage,
      );
    }

    let typology = subscriptionRequest.typology;
    let domaineIds = subscriptionRequest?.subscriptionRequestOnDomaine?.map(
      (o: any) => o.domaineId,
    );
    if (!typology || typology === "generaliste") {
      typology = "expertFiliere";
      domaineIds = (
        await prismaClient.domaine.findMany({ select: { id: true } })
      ).map((d) => d.id);
    }

    //organism check
    const oldOrganism = (
      await getOrganismBySiretAndTypology(
        subscriptionRequest.companySiret,
        typology,
      )
    )
      .unsafeCoerce()
      .extractNullable();

    if (oldOrganism) {
      throw new FunctionalError(
        FunctionalCodeError.ORGANISM_ALREADY_EXISTS,
        `Un organisme existe déjà avec le siret ${subscriptionRequest.companySiret} pour la typologie ${typology}`,
      );
    }

    //account check
    const oldAccount = (
      await getAccountFromEmail(subscriptionRequest.accountEmail)
    )
      .unsafeCoerce()
      .extractNullable();

    if (oldAccount) {
      throw new FunctionalError(
        FunctionalCodeError.ACCOUNT_ALREADY_EXISTS,
        `Un compte existe déjà avec l'email ${subscriptionRequest.accountEmail}`,
      );
    }

    //iam account check
    if (subscriptionRequest.accountEmail === __TEST_IAM_FAIL_CHECK__) {
      throw new FunctionalError(
        FunctionalCodeError.ACCOUNT_IN_IAM_ALREADY_EXISTS,
        "TEST : le compte IAM existe déjà",
      );
    }
    if (subscriptionRequest.accountEmail !== __TEST_IAM_PASS_CHECK__) {
      const oldIamAccount = (
        await getIamAccount({
          email: subscriptionRequest.accountEmail,
          username: subscriptionRequest.accountEmail,
        })
      )
        .unsafeCoerce()
        .extractNullable();

      if (oldIamAccount)
        throw new FunctionalError(
          FunctionalCodeError.ACCOUNT_IN_IAM_ALREADY_EXISTS,
          `Un compte IAM existe déjà avec l'email ${subscriptionRequest.accountEmail}`,
        );
    }

    //organism creation
    const newOrganism = (
      await createOrganism({
        label: subscriptionRequest.companyName ?? "",
        contactAdministrativeEmail: subscriptionRequest.accountEmail ?? "",
        contactAdministrativePhone:
          subscriptionRequest.accountPhoneNumber ?? "",
        website: subscriptionRequest.companyWebsite,
        siret: subscriptionRequest.companySiret ?? "",
        legalStatus: subscriptionRequest.companyLegalStatus,
        isActive: true,
        typology,
        llToEarth: null,
        domaineIds,
        ccnIds:
          subscriptionRequest.subscriptionRequestOnConventionCollective?.map(
            (o: any) => o.ccnId,
          ),
        departmentsWithOrganismMethods:
          subscriptionRequest.departmentsWithOrganismMethods ?? [],
        qualiopiCertificateExpiresAt:
          subscriptionRequest.qualiopiCertificateExpiresAt,
      })
    ).unsafeCoerce();

    logger.info(
      `[validateSubscriptionRequest] Successfuly created organism with siret ${subscriptionRequest.companySiret}`,
    );

    //iam account creation
    const newKeycloakId =
      subscriptionRequest.accountEmail === __TEST_IAM_PASS_CHECK__
        ? randomUUID()
        : (
            await createAccountInIAM({
              email: subscriptionRequest.accountEmail ?? "",
              firstname: subscriptionRequest.accountFirstname ?? "",
              lastname: subscriptionRequest.accountLastname ?? "",
              username: subscriptionRequest.accountEmail ?? "",
              group: "gestionnaire_maison_mere_aap",
            })
          ).unsafeCoerce();

    logger.info(
      `[validateSubscriptionRequest] Successfuly created IAM account ${newKeycloakId}`,
    );

    //db account creation
    const account = (
      await createAccountProfile({
        firstname: subscriptionRequest.accountFirstname ?? "",
        lastname: subscriptionRequest.accountLastname ?? "",
        email: subscriptionRequest.accountEmail ?? "",
        keycloakId: newKeycloakId,
        organismId: newOrganism.id,
      })
    ).unsafeCoerce();

    logger.info(
      `[validateSubscriptionRequest] Successfuly created AP with organismId ${subscriptionRequest.organismId}`,
    );

    const newMaisonMereAAP = await createMaisonMereAAP({
      maisonMereAAP: {
        phone: subscriptionRequest.accountPhoneNumber ?? "",
        raisonSociale: subscriptionRequest.companyName ?? "",
        siteWeb: subscriptionRequest.companyWebsite,
        siret: subscriptionRequest.companySiret ?? "",
        statutJuridique: subscriptionRequest.companyLegalStatus,
        typologie: typology,
        dateExpirationCertificationQualiopi:
          subscriptionRequest.qualiopiCertificateExpiresAt,
        gestionnaireAccountId: account.id,
        statutValidationInformationsJuridiquesMaisonMereAAP: "A_METTRE_A_JOUR",
      },
      domaineIds,
      ccnIds:
        subscriptionRequest.subscriptionRequestOnConventionCollective?.map(
          (o: { ccnId: string }) => o.ccnId,
        ),
      maisonMereAAPOnDepartements:
        subscriptionRequest.departmentsWithOrganismMethods?.map(
          (d: {
            departmentId: string;
            isOnSite: boolean;
            isRemote: boolean;
          }) => ({
            departementId: d.departmentId,
            estSurPlace: d.isOnSite,
            estADistance: d.isRemote,
          }),
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
      `[validateSubscriptionRequest] Successfuly deleted subscriptionRequest ${subscriptionRequest.id}`,
    );

    return "Ok";
  } catch (e) {
    if (e instanceof FunctionalError) {
      throw e;
    } else {
      logger.error(e);
      throw new FunctionalError(
        FunctionalCodeError.TECHNICAL_ERROR,
        "Erreur pendant la validation de la demande d'inscription",
      );
    }
  }
};
