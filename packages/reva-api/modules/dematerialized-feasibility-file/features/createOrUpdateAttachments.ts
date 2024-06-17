import { v4 as uuidV4 } from "uuid";
import { prismaClient } from "../../../prisma/client";
import {
  UploadedFile,
  deleteFile,
  emptyUploadedFileStream,
  getUploadedFile,
  uploadFileToS3,
} from "../../shared/file";
import {
  DematerializedFeasibilityFileCreateOrUpdateAttachmentsInput,
  DematerializedFeasibilityFileType,
} from "../dematerialized-feasibility-file.types";
import { getDematerializedFeasibilityFileWithAttachmentsByCandidacyId } from "./getDematerializedFeasibilityFileWithAttachmentsByCandidacyId";

export const createOrUpdateAttachments = async ({
  candidacyId,
  idCard,
  equivalanceOrExemptionProof,
  trainingCertificate,
  otherAttachments,
}: DematerializedFeasibilityFileCreateOrUpdateAttachmentsInput) => {
  try {
    const dffWithAttachments =
      await getDematerializedFeasibilityFileWithAttachmentsByCandidacyId({
        candidacyId,
      });

    if (!dffWithAttachments) {
      throw new Error(
        `Aucun Dossier de faisabilité trouvé pour la candidature ${candidacyId}.`,
      );
    }

    const attachments = dffWithAttachments.attachments;

    const existingIdCardFile = attachments.find(
      (attachment) => attachment.type === "ID_CARD",
    );
    const existingEquivalanceOrExemptionProofFile = attachments.find(
      (attachment) => attachment.type === "EQUIVALENCE_OR_EXEMPTION_PROOF",
    );
    const existingTrainingCertificateFile = attachments.find(
      (attachment) => attachment.type === "TRAINING_CERTIFICATE",
    );
    const existingOtherAttachmentsFiles = attachments.filter(
      (attachment) => attachment.type === "OTHER",
    );

    const existingFiles = [];
    if (existingIdCardFile) {
      existingFiles.push(existingIdCardFile);
    }
    if (existingEquivalanceOrExemptionProofFile) {
      existingFiles.push(existingEquivalanceOrExemptionProofFile);
    }
    if (existingTrainingCertificateFile) {
      existingFiles.push(existingTrainingCertificateFile);
    }
    if (existingOtherAttachmentsFiles.length) {
      existingFiles.push(...existingOtherAttachmentsFiles);
    }

    if (existingFiles.length) {
      await Promise.all(
        existingFiles.map(({ file: { path } }) => deleteFile(path)),
      );
      await prismaClient.dFFAttachment.deleteMany({
        where: {
          id: {
            in: existingFiles.map(({ id }) => id),
          },
        },
      });
    }

    const idCardFile = await getUploadedFile(idCard);

    const equivalanceOrExemptionProofFile = equivalanceOrExemptionProof
      ? await getUploadedFile(equivalanceOrExemptionProof)
      : undefined;
    const trainingCertificateFile = trainingCertificate
      ? await getUploadedFile(trainingCertificate)
      : undefined;

    const fileAndIds: {
      file: UploadedFile;
      filePath: string;
      dffFileType: DematerializedFeasibilityFileType;
      mimeType: string;
      name: string;
    }[] = [
      {
        file: idCardFile,
        filePath: getFilePath({ candidacyId, fileId: uuidV4() }),
        dffFileType: "ID_CARD",
        mimeType: idCardFile.mimetype,
        name: idCardFile.filename,
      },
    ];

    if (equivalanceOrExemptionProofFile) {
      fileAndIds.push({
        file: equivalanceOrExemptionProofFile,
        filePath: getFilePath({ candidacyId, fileId: uuidV4() }),
        dffFileType: "EQUIVALENCE_OR_EXEMPTION_PROOF",
        mimeType: equivalanceOrExemptionProofFile.mimetype,
        name: equivalanceOrExemptionProofFile.filename,
      });
    }

    if (trainingCertificateFile) {
      fileAndIds.push({
        file: trainingCertificateFile,
        filePath: getFilePath({ candidacyId, fileId: uuidV4() }),
        dffFileType: "TRAINING_CERTIFICATE",
        mimeType: trainingCertificateFile.mimetype,
        name: trainingCertificateFile.filename,
      });
    }

    if (otherAttachments?.length) {
      for (const attachment of otherAttachments) {
        const file = await getUploadedFile(attachment);
        fileAndIds.push({
          file,
          filePath: getFilePath({ candidacyId, fileId: uuidV4() }),
          dffFileType: "OTHER",
          mimeType: file.mimetype,
          name: file.filename,
        });
      }
    }

    for (const { file, filePath } of fileAndIds) {
      await uploadFileToS3({
        file,
        filePath,
      });
    }

    await prismaClient.dematerializedFeasibilityFile.update({
      where: {
        id: dffWithAttachments.id,
      },
      data: {
        attachmentsPartComplete: true,
        attachments: {
          create: fileAndIds.map(
            ({ filePath, mimeType, name, dffFileType }) => ({
              type: dffFileType,
              file: {
                create: {
                  path: filePath,
                  mimeType,
                  name,
                },
              },
            }),
          ),
        },
      },
    });

    return "Ok";
  } finally {
    //every stream must be emptied otherwise the request will hang
    emptyUploadedFileStream(idCard);
    emptyUploadedFileStream(equivalanceOrExemptionProof);
    emptyUploadedFileStream(trainingCertificate);
    otherAttachments?.forEach((attachment) => {
      emptyUploadedFileStream(attachment);
    });
  }
};

const getFilePath = ({
  candidacyId,
  fileId,
}: {
  candidacyId: string;
  fileId: string;
}) => `candidacies/${candidacyId}/dff_files/${fileId}`;
