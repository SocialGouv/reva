import { LegalStatus } from "@prisma/client";
import { v4 as uuidV4 } from "uuid";

import { allowFileTypeByDocumentType } from "@/modules/shared/file/allowFileTypes";
import { UploadedFile } from "@/modules/shared/file/file.interface";
import { uploadFileToS3 } from "@/modules/shared/file/file.service";
import { prismaClient } from "@/prisma/client";

import { deleteOldMaisonMereAAPLegalInformationDocuments } from "./deleteOldMaisonMereAAPLegalInformationDocuments";

type LegalInformationDocumentsSubmission = {
  maisonMereAAPId: string;
  managerFirstname: string;
  managerLastname: string;
  delegataire: boolean;
  siret?: string;
  raisonSociale?: string;
  statutJuridique?: LegalStatus;
  gestionnaireFirstname?: string;
  gestionnaireLastname?: string;
  gestionnaireEmail?: string;
  phone?: string;
  attestationURSSAF?: UploadedFile;
  justificatifIdentiteDirigeant?: UploadedFile;
  lettreDeDelegation?: UploadedFile;
  justificatifIdentiteDelegataire?: UploadedFile;
};

export const submitMaisonMereAAPLegalInformationDocuments = async (
  params: LegalInformationDocumentsSubmission,
) => {
  const { maisonMereAAPId } = params;

  const oldDocuments =
    await prismaClient.maisonMereAAPLegalInformationDocuments.findUnique({
      where: { maisonMereAAPId },
      select: { id: true },
    });

  if (oldDocuments) {
    await deleteOldMaisonMereAAPLegalInformationDocuments({ maisonMereAAPId });
  }

  return createMaisonMereAAPLegalInformationDocuments(params);
};

const createMaisonMereAAPLegalInformationDocuments = async ({
  maisonMereAAPId,
  managerFirstname,
  managerLastname,
  delegataire,
  siret,
  raisonSociale,
  statutJuridique,
  gestionnaireFirstname,
  gestionnaireLastname,
  gestionnaireEmail,
  phone,
  attestationURSSAF,
  justificatifIdentiteDirigeant,
  lettreDeDelegation,
  justificatifIdentiteDelegataire,
}: LegalInformationDocumentsSubmission) => {
  const attestationURSSAFFileId = uuidV4();
  const justificatifIdentiteDirigeantFileId = uuidV4();
  const lettreDeDelegationFileId = uuidV4();
  const justificatifIdentiteDelegataireFileId = uuidV4();

  const filesAndIds = [
    [attestationURSSAF, attestationURSSAFFileId],
    [justificatifIdentiteDirigeant, justificatifIdentiteDirigeantFileId],
    [lettreDeDelegation, lettreDeDelegationFileId],
    [justificatifIdentiteDelegataire, justificatifIdentiteDelegataireFileId],
  ] as const;

  for (const [file, fileId] of filesAndIds) {
    if (file) {
      const filePath = getFilePath({ maisonMereAAPId, fileId });
      await uploadFileToS3({
        filePath,
        mimeType: file.mimetype,
        data: file._buf,
        allowedFileTypes:
          allowFileTypeByDocumentType.maisonMereAAPLegalInformationFile,
      });
    }
  }

  // Seules les pièces exigées par les blocs mis à jour sont transmises.
  const fileToCreate = (file: UploadedFile | undefined, fileId: string) =>
    file
      ? {
          create: {
            id: fileId,
            name: file.filename,
            path: getFilePath({ maisonMereAAPId, fileId }),
            mimeType: file.mimetype,
          },
        }
      : undefined;

  await prismaClient.maisonMereAAPLegalInformationDocuments.create({
    data: {
      maisonMereAAP: { connect: { id: maisonMereAAPId } },
      managerFirstname,
      managerLastname,
      delegataire,
      siret,
      raisonSociale,
      statutJuridique,
      gestionnaireFirstname,
      gestionnaireLastname,
      gestionnaireEmail,
      phone,
      attestationURSSAFFile: fileToCreate(
        attestationURSSAF,
        attestationURSSAFFileId,
      ),
      justificatifIdentiteDirigeantFile: fileToCreate(
        justificatifIdentiteDirigeant,
        justificatifIdentiteDirigeantFileId,
      ),
      lettreDeDelegationFile: fileToCreate(
        lettreDeDelegation,
        lettreDeDelegationFileId,
      ),
      justificatifIdentiteDelegataireFile: fileToCreate(
        justificatifIdentiteDelegataire,
        justificatifIdentiteDelegataireFileId,
      ),
    },
  });

  return prismaClient.maisonMereAAP.update({
    where: { id: maisonMereAAPId },
    data: {
      statutValidationInformationsJuridiquesMaisonMereAAP:
        "EN_ATTENTE_DE_VERIFICATION",
    },
  });
};

const getFilePath = ({
  maisonMereAAPId,
  fileId,
}: {
  maisonMereAAPId: string;
  fileId: string;
}) => `maisonMereAAP/${maisonMereAAPId}/legal_information_documents/${fileId}`;
