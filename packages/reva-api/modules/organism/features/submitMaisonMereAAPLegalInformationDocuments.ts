import { FileService, UploadedFile } from "../../shared/file";
import { prismaClient } from "../../../prisma/client";
import { v4 as uuidV4 } from "uuid";
import { File } from "@prisma/client";

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
      await uploadFile({
        file,
        filePath: getFilePath({ maisonMereAAPId, fileId }),
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

const deleteOldMaisonMereAAPLegalInformationDocuments = async ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) => {
  const oldDocuments =
    await prismaClient.maisonMereAAPLegalInformationDocuments.findUnique({
      where: { maisonMereAAPId },
      include: {
        justificatifIdentiteDelegataireFile: true,
        attestationURSSAFFile: true,
        justificatifIdentiteDirigeantFile: true,
        lettreDeDelegationFile: true,
      },
    });

  const files = [
    oldDocuments?.attestationURSSAFFile,
    oldDocuments?.justificatifIdentiteDirigeantFile,
    oldDocuments?.lettreDeDelegationFile,
    oldDocuments?.justificatifIdentiteDelegataireFile,
  ].filter((d) => !!d) as File[];

  for (const file of files) {
    await deleteFile({ filePath: file.path });
  }

  await prismaClient.maisonMereAAPLegalInformationDocuments.delete({
    where: { maisonMereAAPId },
  });

  await prismaClient.file.deleteMany({
    where: { id: { in: files.map((f) => f.id) } },
  });
};

const getFilePath = ({
  maisonMereAAPId,
  fileId,
}: {
  maisonMereAAPId: string;
  fileId: string;
}) => `maisonMereAAP/${maisonMereAAPId}/legal_information_documents/${fileId}`;

const uploadFile = ({
  filePath,
  file,
}: {
  filePath: string;
  file: UploadedFile;
}) =>
  FileService.getInstance().uploadFile(
    {
      fileKeyPath: filePath,
      fileType: file.mimetype,
    },
    file._buf,
  );

const deleteFile = ({ filePath }: { filePath: string }) =>
  FileService.getInstance().deleteFile({ fileKeyPath: filePath });
