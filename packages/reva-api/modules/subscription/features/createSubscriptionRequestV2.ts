import { getAccountFromEmail } from "../../account/database/accounts";
import * as IAM from "../../account/features/keycloak";
import { getOrganismBySiretAndTypology } from "../../organism/database/organisms";
import { FileService, UploadedFile } from "../../shared/file";
import { buffer } from "stream/consumers";
import { v4 as uuidV4 } from "uuid";
import { prismaClient } from "../../../prisma/client";

export const createSubscriptionRequestV2 = async ({
  params,
}: {
  params: CreateSubscriptionRequestV2Input;
}) => {
  try {
    //organism check
    const oldOrganism = (
      await getOrganismBySiretAndTypology(params.companySiret, "expertFiliere")
    )
      .unsafeCoerce()
      .extractNullable();

    if (oldOrganism) {
      throw new Error(
        `Ce SIRET est déjà associé à un compte. Si nécessaire, contactez votre administrateur ou support@france.vae.fr`,
      );
    }

    //account check
    const oldAccount = (await getAccountFromEmail(params.accountEmail))
      .unsafeCoerce()
      .extractNullable();

    if (oldAccount) {
      throw new Error(
        `Cette adresse mail est déjà associée à un compte. Utilisez une autre adresse mail si vous souhaitez créer une nouvelle agence`,
      );
    }

    const oldIamAccount = (
      await IAM.getAccount({
        email: params.accountEmail,
        username: params.accountEmail,
      })
    )
      .unsafeCoerce()
      .extractNullable();

    if (oldIamAccount)
      throw new Error(
        `Cette adresse mail est déjà associée à un compte. Utilisez une autre adresse mail si vous souhaitez créer une nouvelle agence`,
      );

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
          file,
          filePath: getFilePath({
            subscriptionRequestId,
            fileId,
          }),
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

    await prismaClient.subscriptionRequestV2.create({
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

    return "Ok";
  } finally {
    //every stream must be emptied otherwise the request will hang
    emptyUploadedFileStream(params.attestationURSSAF);
    emptyUploadedFileStream(params.justificatifIdentiteDirigeant);
    emptyUploadedFileStream(params.lettreDeDelegation);
    emptyUploadedFileStream(params.justificatifIdentiteDelegataire);
  }
};

const emptyUploadedFileStream = async (file?: GraphqlUploadedFile) => {
  try {
    if (file) {
      const stream = (await file).createReadStream();
      stream.on("data", () => null);
    }
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

const getFilePath = ({
  subscriptionRequestId,
  fileId,
}: {
  subscriptionRequestId: string;
  fileId: string;
}) =>
  `subscriptions/${subscriptionRequestId}/legal_information_documents/${fileId}`;

const uploadFileToS3 = ({
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
