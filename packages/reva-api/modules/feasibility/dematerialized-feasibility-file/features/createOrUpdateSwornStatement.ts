import { v4 as uuidV4 } from "uuid";

import { allowFileTypeByDocumentType } from "@/modules/shared/file/allowFileTypes";
import {
  deleteFile,
  emptyUploadedFileStream,
  getUploadedFile,
  uploadFilesToS3,
} from "@/modules/shared/file/file.service";
import { prismaClient } from "@/prisma/client";

import { DematerializedFeasibilityFileCreateOrUpdateSwornStatementInput } from "../dematerialized-feasibility-file.types";

import { getDematerializedFeasibilityFileByCandidacyId } from "./getDematerializedFeasibilityFileByCandidacyId";

export const createOrUpdateSwornStatement = async ({
  input: { swornStatement },
  candidacyId,
}: {
  input: DematerializedFeasibilityFileCreateOrUpdateSwornStatementInput;
  candidacyId: string;
}) => {
  try {
    const dff = await getDematerializedFeasibilityFileByCandidacyId({
      candidacyId,
    });

    if (!dff) {
      throw new Error(
        `Aucun Dossier de faisabilité trouvé pour la candidature ${candidacyId}.`,
      );
    }

    const existingSwornStatementFileId = dff.swornStatementFileId;
    if (existingSwornStatementFileId) {
      const existingSwornStatementFile = await prismaClient.file.findUnique({
        where: { id: existingSwornStatementFileId },
      });

      if (existingSwornStatementFile) {
        await deleteFile(existingSwornStatementFile.path);
        await prismaClient.file.delete({
          where: { id: existingSwornStatementFileId },
        });
      }
    }

    const swornStatementFile = await getUploadedFile(swornStatement);

    const fileId = uuidV4();
    const fileAndId: {
      id: string;
      data: Buffer;
      filePath: string;
      mimeType: string;
      name: string;
      allowedFileTypes: string[];
    } = {
      id: fileId,
      data: swornStatementFile._buf,
      filePath: getFilePath({ candidacyId, fileId }),
      mimeType: swornStatementFile.mimetype,
      name: swornStatementFile.filename,
      allowedFileTypes: allowFileTypeByDocumentType.swornStatementFile,
    };

    await uploadFilesToS3([fileAndId]);

    await prismaClient.dematerializedFeasibilityFile.update({
      where: {
        id: dff.id,
      },
      data: {
        attachmentsPartComplete: true,
        swornStatementFile: {
          create: {
            id: fileAndId.id,
            name: fileAndId.name,
            mimeType: fileAndId.mimeType,
            path: fileAndId.filePath,
          },
        },
      },
    });

    return getDematerializedFeasibilityFileByCandidacyId({
      candidacyId,
    });
  } finally {
    //every stream must be emptied otherwise the request will hang
    emptyUploadedFileStream(swornStatement);
  }
};

const getFilePath = ({
  candidacyId,
  fileId,
}: {
  candidacyId: string;
  fileId: string;
}) => `candidacies/${candidacyId}/dff_files/${fileId}`;
