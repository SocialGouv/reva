import { v4 as uuidV4 } from "uuid";

import { allowFileTypeByDocumentType } from "@/modules/shared/file/allowFileTypes";
import {
  emptyUploadedFileStream,
  getUploadedFile,
  uploadFileToS3,
} from "@/modules/shared/file/file.service";
import { prismaClient } from "@/prisma/client";

import { sendSubscriptionRequestCreatedEmail } from "../emails/sendSubscriptionRequestCreatedEmail";

export const createSubscriptionRequest = async ({
  params,
}: {
  params: CreateSubscriptionRequestInput;
}) => {
  const existingSubscriptionRequest =
    await prismaClient.subscriptionRequest.findFirst({
      where: {
        companySiret: params.companySiret,
        status: "PENDING",
      },
    });

  if (existingSubscriptionRequest) {
    throw new Error(
      "Une demande d'inscription est déjà en cours pour cet établissement",
    );
  }

  try {
    const attestationURSSAFFile = await getUploadedFile(
      params.attestationURSSAF,
    );
    const justificatifIdentiteDirigeantFile = await getUploadedFile(
      params.justificatifIdentiteDirigeant,
    );
    const lettreDeDelegationFile = params.lettreDeDelegation
      ? await getUploadedFile(params.lettreDeDelegation)
      : undefined;

    const justificatifIdentiteDelegataireFile =
      params.justificatifIdentiteDelegataire
        ? await getUploadedFile(params.justificatifIdentiteDelegataire)
        : undefined;

    const subscriptionRequestId = uuidV4();
    const attestationURSSAFFileId = uuidV4();
    const justificatifIdentiteDirigeantFileId = uuidV4();
    const lettreDeDelegationFileId = uuidV4();
    const justificatifIdentiteDelegataireFileId = uuidV4();

    const fileAndIds = [
      [attestationURSSAFFile, attestationURSSAFFileId],
      [justificatifIdentiteDirigeantFile, justificatifIdentiteDirigeantFileId],
      [lettreDeDelegationFile, lettreDeDelegationFileId],
      [
        justificatifIdentiteDelegataireFile,
        justificatifIdentiteDelegataireFileId,
      ],
    ] as const;

    for (const [file, fileId] of fileAndIds) {
      if (file) {
        await uploadFileToS3({
          mimeType: file.mimetype,
          data: file._buf,
          filePath: getFilePath({
            subscriptionRequestId,
            fileId,
          }),
          allowedFileTypes:
            allowFileTypeByDocumentType.maisonMereAAPLegalInformationFile,
        });
      }
    }

    const {
      attestationURSSAF,
      justificatifIdentiteDirigeant,
      lettreDeDelegation,
      justificatifIdentiteDelegataire,
      ...paramsWithoutFiles
    } = params;

    await prismaClient.subscriptionRequest.create({
      data: {
        id: subscriptionRequestId,
        ...paramsWithoutFiles,
        attestationURSSAFFile: {
          create: {
            id: attestationURSSAFFileId,
            name: attestationURSSAFFile.filename,
            path: getFilePath({
              subscriptionRequestId,
              fileId: attestationURSSAFFileId,
            }),
            mimeType: attestationURSSAFFile.mimetype,
          },
        },
        justificatifIdentiteDirigeantFile: {
          create: {
            id: justificatifIdentiteDirigeantFileId,
            name: justificatifIdentiteDirigeantFile.filename,
            path: getFilePath({
              subscriptionRequestId,
              fileId: justificatifIdentiteDirigeantFileId,
            }),
            mimeType: justificatifIdentiteDirigeantFile.mimetype,
          },
        },
        lettreDeDelegationFile: lettreDeDelegationFile
          ? {
              create: {
                id: lettreDeDelegationFileId,
                name: lettreDeDelegationFile?.filename,
                path: getFilePath({
                  subscriptionRequestId,
                  fileId: lettreDeDelegationFileId,
                }),
                mimeType: lettreDeDelegationFile?.mimetype,
              },
            }
          : undefined,
        justificatifIdentiteDelegataireFile: justificatifIdentiteDelegataireFile
          ? {
              create: {
                id: justificatifIdentiteDelegataireFileId,
                name: justificatifIdentiteDelegataireFile.filename,
                path: getFilePath({
                  subscriptionRequestId,
                  fileId: justificatifIdentiteDelegataireFileId,
                }),
                mimeType: justificatifIdentiteDelegataireFile.mimetype,
              },
            }
          : undefined,
      },
    });

    sendSubscriptionRequestCreatedEmail({
      email: params.accountEmail,
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

const getFilePath = ({
  subscriptionRequestId,
  fileId,
}: {
  subscriptionRequestId: string;
  fileId: string;
}) =>
  `subscriptions/${subscriptionRequestId}/legal_information_documents/${fileId}`;
