import { getAccountFromEmail } from "../../account/database/accounts";
import * as IAM from "../../account/features/keycloak";
import {
  createOrganism,
  getOrganismBySiretAndTypology,
} from "../../organism/database/organisms";
import { assignMaisonMereAAPToOrganism } from "../../organism/features/assignMaisonMereAAPToOrganism";
import { createMaisonMereAAP } from "../../organism/features/createMaisonMereAAP";
import { logger } from "../../shared/logger";

import { submitMaisonMereAAPLegalInformationDocuments } from "../../organism/features/submitMaisonMereAAPLegalInformationDocuments";
import { UploadedFile } from "../../shared/file";
import { buffer } from "stream/consumers";
import { createAccount } from "../../account/features/createAccount";

export const subscribe = async ({ params }: { params: SubscriptionInput }) => {
  try {
    const getIamAccount = IAM.getAccount;

    //organism check
    const oldOrganism = (
      await getOrganismBySiretAndTypology(params.companySiret, "expertFiliere")
    )
      .unsafeCoerce()
      .extractNullable();

    if (oldOrganism) {
      throw new Error(
        `Un organisme existe déjà avec le siret ${params.companySiret} pour la typologie expertFiliere`,
      );
    }

    //account check
    const oldAccount = (await getAccountFromEmail(params.accountEmail))
      .unsafeCoerce()
      .extractNullable();

    if (oldAccount) {
      throw new Error(
        `Un compte existe déjà avec l'email ${params.accountEmail}`,
      );
    }

    const oldIamAccount = (
      await getIamAccount({
        email: params.accountEmail,
        username: params.accountEmail,
      })
    )
      .unsafeCoerce()
      .extractNullable();

    if (oldIamAccount)
      throw new Error(
        `Un compte IAM existe déjà avec l'email ${params.accountEmail}`,
      );

    //organism creation
    const newOrganism = (
      await createOrganism({
        label: params.companyName ?? "",
        address: "",
        contactAdministrativeEmail: params.accountEmail ?? "",
        contactAdministrativePhone: params.accountPhoneNumber ?? "",
        website: params.companyWebsite,
        city: "",
        zip: "",
        siret: params.companySiret ?? "",
        legalStatus: params.companyLegalStatus,
        isActive: true,
        typology: "expertFiliere",
        llToEarth: null,
        domaineIds: [],
        ccnIds: [],
        departmentsWithOrganismMethods: [],
        qualiopiCertificateExpiresAt: new Date(),
      })
    ).unsafeCoerce();

    logger.info(
      `[subscription] Successfuly created organism with siret ${params.companySiret}`,
    );

    const account = await createAccount({
      email: params.accountEmail ?? "",
      firstname: params.accountFirstname ?? "",
      lastname: params.accountLastname ?? "",
      username: params.accountEmail ?? "",
      group: "gestionnaire_maison_mere_aap",
      organismId: newOrganism.id,
    });

    logger.info(
      `[subscription] Successfuly created Account with organismId ${newOrganism.id}`,
    );

    const newMaisonMereAAP = await createMaisonMereAAP({
      maisonMereAAP: {
        phone: params.accountPhoneNumber ?? "",
        raisonSociale: params.companyName ?? "",
        adresse: "",
        siteWeb: params.companyWebsite,
        ville: "",
        codePostal: "",
        siret: params.companySiret ?? "",
        statutJuridique: params.companyLegalStatus,
        typologie: "expertFiliere",
        dateExpirationCertificationQualiopi: new Date(),
        gestionnaireAccountId: account.id,
        statutValidationInformationsJuridiquesMaisonMereAAP:
          "EN_ATTENTE_DE_VERIFICATION",
      },
      domaineIds: [],
      ccnIds: [],
      maisonMereAAPOnDepartements: [],
    });

    await assignMaisonMereAAPToOrganism({
      organismId: newOrganism.id,
      maisonMereAAPId: newMaisonMereAAP.id,
    });

    await submitMaisonMereAAPLegalInformationDocuments({
      maisonMereAAPId: newMaisonMereAAP.id,
      managerFirstname: params.managerFirstname,
      managerLastname: params.managerLastname,
      delegataire: params.delegataire,
      attestationURSSAF: await getUploadedFile(params.attestationURSSAF),
      justificatifIdentiteDirigeant: await getUploadedFile(
        params.justificatifIdentiteDirigeant,
      ),
      lettreDeDelegation: params.lettreDeDelegation
        ? await getUploadedFile(params.lettreDeDelegation)
        : undefined,
      justificatifIdentiteDelegataire: params.justificatifIdentiteDelegataire
        ? await getUploadedFile(params.justificatifIdentiteDelegataire)
        : undefined,
    });

    return "Ok";
  } finally {
    //every stream must be emptied otherwise the request will hang
    emptyUploadedFileStream(params.attestationURSSAF);
    emptyUploadedFileStream(params.justificatifIdentiteDirigeant);
    emptyUploadedFileStream(params.lettreDeDelegation);
    emptyUploadedFileStream(params.justificatifIdentiteDelegataire);
  }
};

const emptyUploadedFileStream = async (file: GraphqlUploadedFile) => {
  try {
    const stream = (await file).createReadStream();
    stream.on("data", () => null);
  } catch (_) {
    //do nothing
  }
};

const getUploadedFile = async (
  filePromise: GraphqlUploadedFile,
): Promise<UploadedFile> => {
  const file = await filePromise;
  const fileContentBuffer = await buffer(file.createReadStream());
  return {
    filename: file.filename,
    _buf: fileContentBuffer,
    mimetype: file.mimetype,
  };
};
