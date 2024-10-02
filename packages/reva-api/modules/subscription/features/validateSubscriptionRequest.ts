import { File } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { getAccountFromEmail } from "../../account/database/accounts";
import { createAccount } from "../../account/features/createAccount";
import * as IAM from "../../account/features/keycloak";
import { createOrganism } from "../../organism/database/organisms";
import { assignMaisonMereAAPToOrganism } from "../../organism/features/assignMaisonMereAAPToOrganism";
import { createMaisonMereAAP } from "../../organism/features/createMaisonMereAAP";
import { deleteFile } from "../../shared/file";
import { logger } from "../../shared/logger";
import { getDegrees } from "../../referential/features/getDegrees";
import { getMaisonMereAapBySiretAndTypology } from "../../organism/features/getMaisonMereAapBySiretAndTypology";
import { getLastProfessionalCgu } from "../../organism/features/getLastProfessionalCgu";

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

  const oldMaisonMereAap = await getMaisonMereAapBySiretAndTypology(
    subscriptionRequest.companySiret,
    "expertFiliere",
  );

  if (oldMaisonMereAap) {
    throw new Error(
      `Ce SIRET est déjà associé à un compte. Si nécessaire, contactez votre administrateur ou support@france.vae.fr`,
    );
  }

  //account check
  const oldAccount = await getAccountFromEmail(
    subscriptionRequest.accountEmail,
  );

  if (oldAccount) {
    throw new Error(
      `Cette adresse mail est déjà associée à un compte. L'AAP doit utiliser une adresse mail différente pour créer un compte.`,
    );
  }

  const oldIamAccount = await getIamAccount({
    email: subscriptionRequest.accountEmail,
    username: subscriptionRequest.accountEmail,
  });

  if (oldIamAccount)
    throw new Error(
      `Cette adresse mail est déjà associée à un compte. L'AAP doit utiliser une adresse mail différente pour créer un compte.`,
    );

  const degrees = await getDegrees();

  const cgu = await getLastProfessionalCgu({
    maxCreatedAt: subscriptionRequest.createdAt,
  });

  if (!cgu) {
    throw new Error("CGU non trouvées");
  }

  //organism creation
  const newOrganism = await createOrganism({
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
    degreeIds: degrees.map((d) => d.id),
    qualiopiCertificateExpiresAt: new Date(),
    isOnSite: false, //default agency is not on site since we don't have an address
    isHeadAgency: true, // default agency is the head agency
  });

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
      cguVersion: cgu.version,
      cguAcceptedAt: subscriptionRequest.createdAt,
      managerFirstname: subscriptionRequest.managerFirstname,
      managerLastname: subscriptionRequest.managerLastname,
      showAccountSetup: true,
      isSignalized: false,
    },
    ccnIds: [],
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
