import { prismaClient } from "@/prisma/client";

import { getDossierDeValidationFilesNamesAndUrls } from "./getDossierDeValidationFilesNamesAndUrls";

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

  return getDossierDeValidationFilesNamesAndUrls({
    candidacyId,
    fileIds: otherFiles.map((f) => f.fileId),
  });
};
