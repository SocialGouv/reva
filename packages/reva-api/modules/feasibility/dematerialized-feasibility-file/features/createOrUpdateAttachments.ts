import { v4 as uuidV4 } from "uuid";

import { allowFileTypeByDocumentType } from "@/modules/shared/file/allowFileTypes";
import { UploadedFile } from "@/modules/shared/file/file.interface";
import {
  deleteFile,
  emptyUploadedFileStream,
  getUploadedFile,
  uploadFileToS3,
} from "@/modules/shared/file/file.service";
import { prismaClient } from "@/prisma/client";

import {
  DematerializedFeasibilityFileCreateOrUpdateAttachmentsInput,
  DematerializedFeasibilityFileType,
} from "../dematerialized-feasibility-file.types";

import { generateAndUploadFeasibilityFileByCandidacyId } from "./generateAndUploadFeasibilityFileByCandidacyId";
import { getDematerializedFeasibilityFileWithAttachmentsByCandidacyId } from "./getDematerializedFeasibilityFileWithAttachmentsByCandidacyId";
import { resetDFFSentToCandidateState } from "./resetDFFSentToCandidateState";

const MAX_UPLOAD_SIZE = 15728640; // 15Mo

export const createOrUpdateAttachments = async ({
  candidacyId,
  input: {
    idCard,
    equivalenceOrExemptionProof,
    trainingCertificate,
    additionalFiles,
  },
}: {
  input: DematerializedFeasibilityFileCreateOrUpdateAttachmentsInput;
  candidacyId: string;
}) => {
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
    const existingEquivalenceOrExemptionProofFile = attachments.find(
      (attachment) => attachment.type === "EQUIVALENCE_OR_EXEMPTION_PROOF",
    );
    const existingTrainingCertificateFile = attachments.find(
      (attachment) => attachment.type === "TRAINING_CERTIFICATE",
    );
    const existingOtherAttachmentsFiles = attachments.filter(
      (attachment) => attachment.type === "ADDITIONAL",
    );

    const existingFiles = [];
    if (existingIdCardFile) {
      existingFiles.push(existingIdCardFile);
    }
    if (existingEquivalenceOrExemptionProofFile) {
      existingFiles.push(existingEquivalenceOrExemptionProofFile);
    }
    if (existingTrainingCertificateFile) {
      existingFiles.push(existingTrainingCertificateFile);
    }
    if (existingOtherAttachmentsFiles.length) {
      existingFiles.push(...existingOtherAttachmentsFiles);
    }

    const idCardFile = await getUploadedFile(idCard);

    const equivalenceOrExemptionProofFile = equivalenceOrExemptionProof
      ? await getUploadedFile(equivalenceOrExemptionProof)
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

    if (equivalenceOrExemptionProofFile) {
      fileAndIds.push({
        file: equivalenceOrExemptionProofFile,
        filePath: getFilePath({ candidacyId, fileId: uuidV4() }),
        dffFileType: "EQUIVALENCE_OR_EXEMPTION_PROOF",
        mimeType: equivalenceOrExemptionProofFile.mimetype,
        name: equivalenceOrExemptionProofFile.filename,
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

    if (additionalFiles?.length) {
      for (const attachment of additionalFiles) {
        const file = await getUploadedFile(attachment);
        fileAndIds.push({
          file,
          filePath: getFilePath({ candidacyId, fileId: uuidV4() }),
          dffFileType: "ADDITIONAL",
          mimeType: file.mimetype,
          name: file.filename,
        });
      }
    }

    for (const { file } of fileAndIds) {
      if (file._buf.length > MAX_UPLOAD_SIZE) {
        throw new Error(
          `Le fichier ${file.filename} est trop volumineux (${(file._buf.length / 1024 / 1024).toFixed(2)} Mo). La taille maximale autorisée est de ${MAX_UPLOAD_SIZE / 1024 / 1024} Mo.`,
        );
      }
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

    for (const { file, filePath } of fileAndIds) {
      await uploadFileToS3({
        filePath,
        mimeType: file.mimetype,
        data: file._buf,
        allowedFileTypes: allowFileTypeByDocumentType.feasibilityAttachmentFile,
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

    if (dffWithAttachments.sentToCandidateAt) {
      await resetDFFSentToCandidateState(dffWithAttachments);
    }

    try {
      await generateAndUploadFeasibilityFileByCandidacyId(candidacyId);
    } catch (error) {
      console.error(error);
    }

    return "Ok";
  } finally {
    //every stream must be emptied otherwise the request will hang
    emptyUploadedFileStream(idCard);
    emptyUploadedFileStream(equivalenceOrExemptionProof);
    emptyUploadedFileStream(trainingCertificate);
    additionalFiles?.forEach((attachment) => {
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
