import { v4 } from "uuid";

import {
  CANDIDATURE_NON_TROUVEE,
  DOSSIER_FAISABILITE_DEMATERIALISE_NON_TROUVE,
  DOSSIER_FAISABILITE_NON_TROUVE,
} from "@/modules/shared/errors/messages";
import {
  deleteFile,
  S3File,
  uploadFilesToS3,
} from "@/modules/shared/file/file.service";
import { prismaClient } from "@/prisma/client";

import { generateFeasibilityFileByCandidacyId } from "./generateFeasibilityFileByCandidacyId";

export const generateAndUploadFeasibilityFileByCandidacyId = async (
  candidacyId: string,
): Promise<void> => {
  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
    select: {
      Feasibility: {
        where: {
          isActive: true,
        },
        select: {
          dematerializedFeasibilityFile: {
            select: {
              id: true,
              feasibilityFileId: true,
            },
          },
        },
      },
    },
  });

  if (!candidacy) {
    throw new Error(CANDIDATURE_NON_TROUVEE);
  }

  const feasibility = candidacy.Feasibility[0];
  if (!feasibility) {
    throw new Error(DOSSIER_FAISABILITE_NON_TROUVE);
  }

  const { dematerializedFeasibilityFile } = feasibility;
  if (!dematerializedFeasibilityFile) {
    throw new Error(DOSSIER_FAISABILITE_DEMATERIALISE_NON_TROUVE);
  }

  const data = await generateFeasibilityFileByCandidacyId(candidacyId);

  if (!data) {
    throw new Error(
      "Une erreur est survenue lors de la génération du pdf du dossier de faisabilité dématérialisé",
    );
  }

  const files: S3File[] = [];

  const feasibilityFileInstance: S3File = {
    filePath: `candidacies/${candidacyId}/feasibility/${v4()}`,
    data: data,
    mimeType: "application/pdf",
    allowedFileTypes: ["application/pdf"],
  };
  files.push(feasibilityFileInstance);

  await uploadFilesToS3(files);

  // Delete previous pdf if exists
  if (dematerializedFeasibilityFile.feasibilityFileId) {
    const dffFile = await prismaClient.file.findUnique({
      where: { id: dematerializedFeasibilityFile.feasibilityFileId },
    });

    if (dffFile) {
      await prismaClient.file.delete({
        where: {
          id: dffFile.id,
        },
      });
      await deleteFile(dffFile.path);
    }
  }

  await prismaClient.dematerializedFeasibilityFile.update({
    where: {
      id: dematerializedFeasibilityFile.id,
    },
    data: {
      feasibilityFile: {
        create: {
          mimeType: feasibilityFileInstance.mimeType,
          name: "dossier_de_faisabilite",
          path: feasibilityFileInstance.filePath,
        },
      },
    },
  });
};
