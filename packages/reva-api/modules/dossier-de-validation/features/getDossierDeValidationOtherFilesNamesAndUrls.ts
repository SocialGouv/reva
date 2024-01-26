import { prismaClient } from "../../../prisma/client";
import { getFilesNamesAndUrls } from "./getFilesNamesAndUrls";

export const getDossierDeValidationOtherFilesNamesAndUrls = async ({
  candidacyId,
  dossierDeValidationId,
}: {
  candidacyId: string;
  dossierDeValidationId: string;
}) => {
  const otherFiles =
    await prismaClient.dossierDeValidationOtherFilesOnFile.findMany({
      where: { dossierDeValidationId },
    });

  return getFilesNamesAndUrls({
    candidacyId,
    fileIds: otherFiles.map((f) => f.fileId),
  });
};
