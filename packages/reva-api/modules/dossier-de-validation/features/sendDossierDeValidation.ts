import { v4 as uuidV4 } from "uuid";

import { prismaClient } from "../../../prisma/client";
import { updateCandidacyStatus } from "../../candidacy/features/updateCandidacyStatus";
import { FileService, UploadedFile } from "../../shared/file";

export const sendDossierDeValidation = async ({
  candidacyId,
  dossierDeValidationFile,
}: {
  candidacyId: string;
  dossierDeValidationFile: UploadedFile;
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

  const fileUuid = uuidV4();
  await FileService.getInstance().uploadFile(
    {
      fileKeyPath: `${candidacyId}/${fileUuid}`,
      fileType: dossierDeValidationFile.mimetype,
    },
    dossierDeValidationFile.data
  );

  const dossierDeValidation = await prismaClient.dossierDeValidation.create({
    data: {
      dossierDeValidationSentAt: new Date(),
      candidacy: { connect: { id: candidacyId } },
      dossierDeValidationFile: {
        create: {
          name: dossierDeValidationFile.filename,
          mimeType: dossierDeValidationFile.mimetype,
          id: fileUuid,
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
