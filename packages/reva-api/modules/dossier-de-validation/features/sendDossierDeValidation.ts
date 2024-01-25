import { v4 as uuidV4 } from "uuid";

import { prismaClient } from "../../../prisma/client";
import { updateCandidacyStatus } from "../../candidacy/features/updateCandidacyStatus";
import { FileService, UploadedFile } from "../../shared/file";

export const sendDossierDeValidation = async ({
  candidacyId,
  dossierDeValidationFile,
  dossierDeValidationOtherFiles,
}: {
  candidacyId: string;
  dossierDeValidationFile: UploadedFile;
  dossierDeValidationOtherFiles: UploadedFile[];
}) => {
  const candidacy = await prismaClient.candidacy.findFirst({
    where: { id: candidacyId },
    include: {
      candidacyDropOut: true,
      candidacyStatuses: { where: { isActive: true } },
    },
  });
  if (!candidacy) {
    throw new Error("La candidature n'a pas été trouvée");
  }
  if (candidacy.candidacyDropOut) {
    throw new Error("La candidature a été abandonnée");
  }

  if (candidacy.candidacyStatuses?.[0]?.status === "ARCHIVE") {
    throw new Error("La candidature a été supprimée");
  }

  const dossierDeValidationFileId = uuidV4();
  await uploadFile({
    candidacyId,
    fileUuid: dossierDeValidationFileId,
    file: dossierDeValidationFile,
  });

  const dossierDeValidationOtherFilesWithIds: {
    file: UploadedFile;
    id: string;
  }[] = dossierDeValidationOtherFiles.map((f) => ({ id: uuidV4(), file: f }));

  for (const d of dossierDeValidationOtherFilesWithIds) {
    await uploadFile({
      candidacyId,
      fileUuid: d.id,
      file: d.file,
    });
  }

  await prismaClient.file.createMany({
    data: dossierDeValidationOtherFilesWithIds.map((d) => ({
      id: d.id,
      mimeType: d.file.mimetype,
      name: d.file.filename,
    })),
  });

  const dossierDeValidation = await prismaClient.dossierDeValidation.create({
    data: {
      dossierDeValidationSentAt: new Date(),
      candidacy: { connect: { id: candidacyId } },
      dossierDeValidationFile: {
        create: {
          name: dossierDeValidationFile.filename,
          mimeType: dossierDeValidationFile.mimetype,
          id: dossierDeValidationFileId,
        },
      },
      dossierDeValidationOtherFiles: {
        createMany: {
          data: dossierDeValidationOtherFilesWithIds.map((fileWithId) => ({
            fileId: fileWithId.id,
          })),
        },
      },
    },
  });

  await updateCandidacyStatus({
    candidacyId,
    status: "DOSSIER_DE_VALIDATION_ENVOYE",
  });

  return dossierDeValidation;
};

const uploadFile = ({
  candidacyId,
  fileUuid,
  file,
}: {
  candidacyId: string;
  fileUuid: string;
  file: UploadedFile;
}) =>
  FileService.getInstance().uploadFile(
    {
      fileKeyPath: `${candidacyId}/${fileUuid}`,
      fileType: file.mimetype,
    },
    file.data
  );
