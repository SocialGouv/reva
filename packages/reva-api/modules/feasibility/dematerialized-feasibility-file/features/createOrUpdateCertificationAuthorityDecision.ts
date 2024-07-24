import { v4 as uuidV4 } from "uuid";
import {
  UploadedFile,
  deleteFile,
  emptyUploadedFileStream,
  getUploadedFile,
  uploadFilesToS3,
} from "../../../../modules/shared/file";
import { prismaClient } from "../../../../prisma/client";
import { DematerializedFeasibilityFileCreateOrUpdateCertificationAuthorityDecisionInput } from "../dematerialized-feasibility-file.types";
import { getDematerializedFeasibilityFileByCandidacyId } from "./getDematerializedFeasibilityFileByCandidacyId";
import { getDematerializedFeasibilityFileWithFeasibilityFileByCandidacyId } from "./getDematerializedFeasibilityFileWithFeasibilityFileByCandidacyId";

export const createOrUpdateCertificationAuthorityDecision = async ({
  candidacyId,
  input,
}: {
  candidacyId: string;
  input: DematerializedFeasibilityFileCreateOrUpdateCertificationAuthorityDecisionInput;
}) => {
  try {
    const dff =
      await getDematerializedFeasibilityFileWithFeasibilityFileByCandidacyId({
        candidacyId,
      });

    if (!dff) {
      throw new Error(
        `Aucun Dossier de faisabilité trouvé pour la candidature ${candidacyId}.`,
      );
    }

    const { decision, decisionFile, decisionComment } = input;

    const feasibility = dff.feasibility;

    const existingDecisionFileId = feasibility.decisionFileId;
    if (existingDecisionFileId) {
      const existingDecisionFile = await prismaClient.file.findUnique({
        where: { id: existingDecisionFileId },
      });

      if (existingDecisionFile) {
        await deleteFile(existingDecisionFile.path);
        await prismaClient.file.delete({
          where: { id: existingDecisionFileId },
        });
      }
    }

    const decisionUploadedFile = await getUploadedFile(decisionFile);

    const fileId = uuidV4();
    const fileAndId: {
      id: string;
      file: UploadedFile;
      filePath: string;
      mimeType: string;
      name: string;
    } = {
      id: fileId,
      file: decisionUploadedFile,
      filePath: getFilePath({ candidacyId, fileId }),
      mimeType: decisionUploadedFile.mimetype,
      name: decisionUploadedFile.filename,
    };

    await uploadFilesToS3([fileAndId]);
    const now = new Date().toISOString();

    await prismaClient.feasibility.update({
      where: {
        id: feasibility.id,
      },
      data: {
        decision,
        decisionComment,
        decisionSentAt: now,
        decisionFile: {
          create: {
            id: fileId,
            path: fileAndId.filePath,
            name: fileAndId.name,
            mimeType: fileAndId.mimeType,
          },
        },
      },
    });

    return getDematerializedFeasibilityFileByCandidacyId({
      candidacyId,
    });
  } finally {
    //every stream must be emptied otherwise the request will hang
    emptyUploadedFileStream(input.decisionFile);
  }
};

const getFilePath = ({
  candidacyId,
  fileId,
}: {
  candidacyId: string;
  fileId: string;
}) => `candidacies/${candidacyId}/dff_files/${fileId}`;