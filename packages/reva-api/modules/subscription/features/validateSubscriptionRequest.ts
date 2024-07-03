import { File } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { getAccountFromEmail } from "../../account/database/accounts";
import { createAccount } from "../../account/features/createAccount";
import * as IAM from "../../account/features/keycloak";
import {
  createOrganism,
  getOrganismBySiretAndTypology,
} from "../../organism/database/organisms";
import { assignMaisonMereAAPToOrganism } from "../../organism/features/assignMaisonMereAAPToOrganism";
import { createMaisonMereAAP } from "../../organism/features/createMaisonMereAAP";
import { deleteFile } from "../../shared/file";
import { logger } from "../../shared/logger";
import { getDepartments } from "../../referential/features/getDepartments";

export const validateSubscriptionRequest = async ({
  subscriptionRequestId,
}: {
  subscriptionRequestId: string;
}) => {
  const subscriptionRequest = await prismaClient.subscriptionRequest.findUnique(
    {
      where: {
        id: subscriptionRequestId,
      },
      include: {
        attestationURSSAFFile: true,
        justificatifIdentiteDelegataireFile: true,
        justificatifIdentiteDirigeantFile: true,
        lettreDeDelegationFile: true,
      },
    },
  );

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
      `Cette adresse mail est déjà associée à un compte. L'AAP doit utiliser une adresse mail différente pour créer un compte.`,
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
      `Cette adresse mail est déjà associée à un compte. L'AAP doit utiliser une adresse mail différente pour créer un compte.`,
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
      isOnSite: false, //default agency is not on site since we don't have an address
      isHeadAgency: true, // default agency is the head agency
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

  const allDepartements = await getDepartments();

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
      cguVersion: null,
      cguAcceptedAt: null,
      managerFirstname: subscriptionRequest.managerFirstname,
      managerLastname: subscriptionRequest.managerLastname,
    },
    ccnIds: [],
    maisonMereAAPOnDepartements: allDepartements.map((d) => ({
      departementId: d.id,
      estADistance: true,
      estSurPlace: true,
    })),
  });

  await assignMaisonMereAAPToOrganism({
    organismId: newOrganism.id,
    maisonMereAAPId: newMaisonMereAAP.id,
  });

  await prismaClient.subscriptionRequest.delete({
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
    await deleteFile(file.path);
  }

  await prismaClient.file.deleteMany({
    where: { id: { in: files.map((f) => f.id) } },
  });
};
