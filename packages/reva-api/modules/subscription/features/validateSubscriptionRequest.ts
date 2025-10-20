import { File } from "@prisma/client";

import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "@/modules/aap-log/features/logAAPAuditEvent";
import { createAccount } from "@/modules/account/features/createAccount";
import { getAccountByEmail } from "@/modules/account/features/getAccountByEmail";
import * as IAM from "@/modules/account/features/keycloak";
import { createOrganism } from "@/modules/organism/database/organisms";
import { assignMaisonMereAAPToOrganism } from "@/modules/organism/features/assignMaisonMereAAPToOrganism";
import { createMaisonMereAAP } from "@/modules/organism/features/createMaisonMereAAP";
import { getLastProfessionalCgu } from "@/modules/organism/features/getLastProfessionalCgu";
import { getMaisonMereAapBySiretAndTypology } from "@/modules/organism/features/getMaisonMereAapBySiretAndTypology";
import { getDegrees } from "@/modules/referential/features/getDegrees";
import { deleteFile } from "@/modules/shared/file/file.service";
import { logger } from "@/modules/shared/logger/logger";
import { prismaClient } from "@/prisma/client";

export const validateSubscriptionRequest = async ({
  subscriptionRequestId,
  userInfo,
}: {
  subscriptionRequestId: string;
  userInfo: AAPAuditLogUserInfo;
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
  const oldAccount = await getAccountByEmail(subscriptionRequest.accountEmail);

  if (oldAccount) {
    throw new Error(
      `Cette adresse électronique est déjà associée à un compte. L'AAP doit utiliser une adresse électronique différente pour créer un compte.`,
    );
  }

  const oldIamAccount = await getIamAccount({
    email: subscriptionRequest.accountEmail,
    username: subscriptionRequest.accountEmail,
  });

  if (oldIamAccount)
    throw new Error(
      `Cette adresse électronique est déjà associée à un compte. L'AAP doit utiliser une adresse électronique différente pour créer un compte.`,
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
    typology: "expertFiliere",
    llToEarth: null,
    ccnIds: [],
    degreeIds: degrees.map((d) => d.id),
    qualiopiCertificateExpiresAt: new Date(),
    modaliteAccompagnement: "A_DISTANCE",
    modaliteAccompagnementRenseigneeEtValide: false,
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
    maisonMereAAPRaisonSociale: subscriptionRequest.companyName ?? "",
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
      isActive: true,
      isSignalized: false,
      isMCFCompatible: null,
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

  await logAAPAuditEvent({
    maisonMereAAPId: newMaisonMereAAP.id,
    eventType: "SUBCRIBTION_REQUEST_VALIDATED",
    userInfo,
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
