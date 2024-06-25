import { v4 as uuidV4 } from "uuid";
import { prismaClient } from "../../../prisma/client";
import {
  UploadedFile,
  emptyUploadedFileStream,
  getUploadedFile,
  uploadFilesToS3,
} from "../../shared/file";
import { DematerializedFeasibilityFileSubmitSwornStatementInput } from "../dematerialized-feasibility-file.types";
import { getDematerializedFeasibilityFileWithAttachmentsByCandidacyId } from "./getDematerializedFeasibilityFileWithAttachmentsByCandidacyId";
import { getDematerializedFeasibilityFileByCandidacyId } from "./getDematerializedFeasibilityFileByCandidacyId";

export const submitSwornStatement = async ({
  candidacyId,
  swornStatement,
}: DematerializedFeasibilityFileSubmitSwornStatementInput) => {
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

    const swornStatementFile = await getUploadedFile(swornStatement);

    const fileId = uuidV4();
    const fileAndId: {
      id: string;
      file: UploadedFile;
      filePath: string;
      mimeType: string;
      name: string;
    } = {
      id: fileId,
      file: swornStatementFile,
      filePath: getFilePath({ candidacyId, fileId }),
      mimeType: swornStatementFile.mimetype,
      name: swornStatementFile.filename,
    };

    await uploadFilesToS3([fileAndId]);

    await prismaClient.dematerializedFeasibilityFile.update({
      where: {
        id: dffWithAttachments.id,
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
