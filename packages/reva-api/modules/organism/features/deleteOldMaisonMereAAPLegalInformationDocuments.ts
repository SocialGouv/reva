import { File } from "@prisma/client";

import { deleteFile } from "@/modules/shared/file/file.service";
import { prismaClient } from "@/prisma/client";

export const deleteOldMaisonMereAAPLegalInformationDocuments = async ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) => {
  const oldDocuments =
    await prismaClient.maisonMereAAPLegalInformationDocuments.findUnique({
      where: { maisonMereAAPId },
      include: {
        justificatifIdentiteDelegataireFile: true,
        attestationURSSAFFile: true,
        justificatifIdentiteDirigeantFile: true,
        lettreDeDelegationFile: true,
      },
    });

  const files = [
    oldDocuments?.attestationURSSAFFile,
    oldDocuments?.justificatifIdentiteDirigeantFile,
    oldDocuments?.lettreDeDelegationFile,
    oldDocuments?.justificatifIdentiteDelegataireFile,
  ].filter((d) => !!d) as File[];

  for (const file of files) {
    await deleteFile(file.path);
  }

  await prismaClient.maisonMereAAPLegalInformationDocuments.delete({
    where: { maisonMereAAPId },
  });

  await prismaClient.file.deleteMany({
    where: { id: { in: files.map((f) => f.id) } },
  });
};
