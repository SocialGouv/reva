import { getAccountFromEmail } from "../../account/database/accounts";
import * as IAM from "../../account/features/keycloak";
import {
  createOrganism,
  getOrganismBySiretAndTypology,
} from "../../organism/database/organisms";
import { assignMaisonMereAAPToOrganism } from "../../organism/features/assignMaisonMereAAPToOrganism";
import { createMaisonMereAAP } from "../../organism/features/createMaisonMereAAP";
import { logger } from "../../shared/logger";
import { createAccount } from "../../account/features/createAccount";
import { prismaClient } from "../../../prisma/client";
import { FileService } from "../../shared/file";
import { File } from "@prisma/client";

export const validateSubscriptionRequestV2 = async ({
  subscriptionRequestId,
}: {
  subscriptionRequestId: string;
}) => {
  const subscriptionRequest =
    await prismaClient.subscriptionRequestV2.findUnique({
      where: {
        id: subscriptionRequestId,
      },
      include: {
        attestationURSSAFFile: true,
        justificatifIdentiteDelegataireFile: true,
        justificatifIdentiteDirigeantFile: true,
        lettreDeDelegationFile: true,
      },
    });

  if (!subscriptionRequest) {
    throw new Error("Demande d'inscription non trouvée");
  }

  const getIamAccount = IAM.getAccount;

  //organism check
  const oldOrganism = (
    await getOrganismBySiretAndTypology(
      subscriptionRequest.companySiret,
      "expertFiliere",
    )
  )
    .unsafeCoerce()
    .extractNullable();

  if (oldOrganism) {
    throw new Error(
      `Un organisme existe déjà avec le siret ${subscriptionRequest.companySiret}`,
    );
  }

  //account check
  const oldAccount = (
    await getAccountFromEmail(subscriptionRequest.accountEmail)
  )
    .unsafeCoerce()
    .extractNullable();

  if (oldAccount) {
    throw new Error(
      `Un compte existe déjà avec l'email ${subscriptionRequest.accountEmail}`,
    );
  }

  const oldIamAccount = (
    await getIamAccount({
      email: subscriptionRequest.accountEmail,
      username: subscriptionRequest.accountEmail,
    })
  )
    .unsafeCoerce()
    .extractNullable();

  if (oldIamAccount)
    throw new Error(
      `Un compte utilisateur existe déjà avec l'email ${subscriptionRequest.accountEmail}`,
    );

  //organism creation
  const newOrganism = (
    await createOrganism({
      label: subscriptionRequest.companyName ?? "",
      contactAdministrativeEmail: subscriptionRequest.accountEmail ?? "",
      contactAdministrativePhone: subscriptionRequest.accountPhoneNumber ?? "",
      website: subscriptionRequest.companyWebsite,
      siret: subscriptionRequest.companySiret ?? "",
      legalStatus: subscriptionRequest.companyLegalStatus,
      isActive: true,
      typology: "expertFiliere",
      llToEarth: null,
      domaineIds: [],
      ccnIds: [],
      departmentsWithOrganismMethods: [],
      qualiopiCertificateExpiresAt: new Date(),
      isOnSite: true, //default agency is on site
    })
  ).unsafeCoerce();

  logger.info(
    `[subscription] Successfuly created organism with siret ${subscriptionRequest.companySiret}`,
  );

  const account = await createAccount({
    email: subscriptionRequest.accountEmail ?? "",
    firstname: subscriptionRequest.accountFirstname ?? "",
    lastname: subscriptionRequest.accountLastname ?? "",
    username: subscriptionRequest.accountEmail ?? "",
    group: "gestionnaire_maison_mere_aap",
    organismId: newOrganism.id,
  });

  logger.info(
    `[subscription] Successfuly created Account with organismId ${newOrganism.id}`,
  );

  const newMaisonMereAAP = await createMaisonMereAAP({
    maisonMereAAP: {
      phone: subscriptionRequest.accountPhoneNumber ?? "",
      raisonSociale: subscriptionRequest.companyName ?? "",
      siteWeb: subscriptionRequest.companyWebsite,
      siret: subscriptionRequest.companySiret ?? "",
      statutJuridique: subscriptionRequest.companyLegalStatus,
      typologie: "expertFiliere",
      dateExpirationCertificationQualiopi: new Date(),
      gestionnaireAccountId: account.id,
      statutValidationInformationsJuridiquesMaisonMereAAP: "A_JOUR",
    },
    ccnIds: [],
    maisonMereAAPOnDepartements: [],
  });

  await assignMaisonMereAAPToOrganism({
    organismId: newOrganism.id,
    maisonMereAAPId: newMaisonMereAAP.id,
  });

  await prismaClient.subscriptionRequestV2.delete({
    where: { id: subscriptionRequestId },
  });

  await deleteFiles({
    files: [
      subscriptionRequest.attestationURSSAFFile,
      subscriptionRequest.justificatifIdentiteDirigeantFile,
      subscriptionRequest.lettreDeDelegationFile,
      subscriptionRequest.justificatifIdentiteDelegataireFile,
    ].filter((f) => !!f) as File[],
  });

  return "Ok";
};

const deleteFiles = async ({ files }: { files: File[] }) => {
  for (const file of files) {
    await FileService.getInstance().deleteFile({ fileKeyPath: file.path });
  }

  await prismaClient.file.deleteMany({
    where: { id: { in: files.map((f) => f.id) } },
  });
};
