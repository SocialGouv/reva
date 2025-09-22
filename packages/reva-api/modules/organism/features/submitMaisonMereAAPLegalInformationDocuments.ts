import { v4 as uuidV4 } from "uuid";

import { allowFileTypeByDocumentType } from "@/modules/shared/file/allowFileTypes";
import { UploadedFile } from "@/modules/shared/file/file.interface";
import { uploadFileToS3 } from "@/modules/shared/file/file.service";
import { prismaClient } from "@/prisma/client";

import { deleteOldMaisonMereAAPLegalInformationDocuments } from "./deleteOldMaisonMereAAPLegalInformationDocuments";

export const submitMaisonMereAAPLegalInformationDocuments = async (params: {
  maisonMereAAPId: string;
  managerFirstname: string;
  managerLastname: string;
  delegataire: boolean;
  attestationURSSAF: UploadedFile;
  justificatifIdentiteDirigeant: UploadedFile;
  lettreDeDelegation?: UploadedFile;
  justificatifIdentiteDelegataire?: UploadedFile;
}) => {
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
  attestationURSSAF,
  justificatifIdentiteDirigeant,
  lettreDeDelegation,
  justificatifIdentiteDelegataire,
}: {
  maisonMereAAPId: string;
  managerFirstname: string;
  managerLastname: string;
  delegataire: boolean;
  attestationURSSAF: UploadedFile;
  justificatifIdentiteDirigeant: UploadedFile;
  lettreDeDelegation?: UploadedFile;
  justificatifIdentiteDelegataire?: UploadedFile;
}) => {
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

  await prismaClient.maisonMereAAPLegalInformationDocuments.create({
    data: {
      maisonMereAAP: { connect: { id: maisonMereAAPId } },
      managerFirstname,
      managerLastname,
      delegataire,
      attestationURSSAFFile: {
        create: {
          id: attestationURSSAFFileId,
          name: attestationURSSAF.filename,
          path: getFilePath({
            maisonMereAAPId,
            fileId: attestationURSSAFFileId,
          }),
          mimeType: attestationURSSAF.mimetype,
        },
      },
      justificatifIdentiteDirigeantFile: {
        create: {
          id: justificatifIdentiteDirigeantFileId,
          name: justificatifIdentiteDirigeant.filename,
          path: getFilePath({
            maisonMereAAPId,
            fileId: justificatifIdentiteDirigeantFileId,
          }),
          mimeType: justificatifIdentiteDirigeant.mimetype,
        },
      },
      lettreDeDelegationFile: lettreDeDelegation
        ? {
            create: {
              id: lettreDeDelegationFileId,
              name: lettreDeDelegation?.filename,
              path: getFilePath({
                maisonMereAAPId,
                fileId: lettreDeDelegationFileId,
              }),
              mimeType: lettreDeDelegation?.mimetype,
            },
          }
        : undefined,
      justificatifIdentiteDelegataireFile: justificatifIdentiteDelegataire
        ? {
            create: {
              id: justificatifIdentiteDelegataireFileId,
              name: justificatifIdentiteDelegataire.filename,
              path: getFilePath({
                maisonMereAAPId,
                fileId: justificatifIdentiteDelegataireFileId,
              }),
              mimeType: justificatifIdentiteDelegataire.mimetype,
            },
          }
        : undefined,
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
