import { prismaClient } from "../../../prisma/client";
import { getFileNameAndUrl } from "../../shared/file/getFileNameAndUrl";

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
