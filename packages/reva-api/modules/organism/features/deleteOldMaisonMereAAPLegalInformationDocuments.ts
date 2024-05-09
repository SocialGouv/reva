import { FileService } from "../../shared/file";
import { prismaClient } from "../../../prisma/client";
import { File } from "@prisma/client";

const deleteFile = ({ filePath }: { filePath: string }) =>
  FileService.getInstance().deleteFile({ fileKeyPath: filePath });


export const deleteOldMaisonMereAAPLegalInformationDocuments = async ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) => {
  const oldDocuments = await prismaClient.maisonMereAAPLegalInformationDocuments.findUnique({
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
    await deleteFile({ filePath: file.path });
  }

  await prismaClient.maisonMereAAPLegalInformationDocuments.delete({
    where: { maisonMereAAPId },
  });

  await prismaClient.file.deleteMany({
    where: { id: { in: files.map((f) => f.id) } },
  });
};
