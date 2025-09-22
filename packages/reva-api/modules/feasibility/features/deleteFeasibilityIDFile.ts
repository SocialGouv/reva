import { deleteFile } from "@/modules/shared/file/file.service";
import { prismaClient } from "@/prisma/client";

export const deleteFeasibilityIDFile = async (feasibilityId: string) => {
  const feasibility = await prismaClient.feasibility.findUnique({
    where: { id: feasibilityId },
    include: {
      feasibilityUploadedPdf: {
        include: {
          IDFile: true,
        },
      },
      dematerializedFeasibilityFile: {
        include: { attachments: { include: { file: true } } },
      },
    },
  });

  const DffIDFile =
    feasibility?.dematerializedFeasibilityFile?.attachments?.find(
      (a) => a.type === "ID_CARD",
    );
  const PdfIDFile = feasibility?.feasibilityUploadedPdf?.IDFile;

  if (DffIDFile) {
    await prismaClient.$transaction([
      prismaClient.dFFAttachment.delete({
        where: {
          id: DffIDFile.id,
        },
      }),
      prismaClient.file.delete({
        where: {
          id: DffIDFile.file.id,
        },
      }),
    ]);
    await deleteFile(DffIDFile.file.path);
  }

  if (PdfIDFile) {
    await prismaClient.file.delete({
      where: {
        id: PdfIDFile.id,
      },
    });

    await deleteFile(PdfIDFile.path);
  }
};
