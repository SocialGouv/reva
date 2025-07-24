import { getFileNameAndUrl } from "@/modules/shared/file/getFileNameAndUrl";
import { prismaClient } from "@/prisma/client";

export const getAdditionalDocumentsFilaNamesAndUrlsByCertificationAdditionalInfoId =
  async ({
    certificationAdditionalInfoId,
  }: {
    certificationAdditionalInfoId: string;
  }) => {
    const additionalDocuments =
      await prismaClient.certificationAdditionalInfoAdditionalDocument.findMany(
        {
          where: { certificationAdditionalInfoId },
        },
      );

    return additionalDocuments.map((additionalDocument) =>
      getFileNameAndUrl({
        fileId: additionalDocument.fileId,
      }),
    );
  };
