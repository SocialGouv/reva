import { prismaClient } from "@/prisma/client";

import {
  FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND,
  OOS_DOMAIN,
  getDownloadLink,
} from "../..//shared/file";

export const getMaisonMereAAPLegalInformationDocumentFileNameUrlAndMimeType =
  async ({
    maisonMereAAPId,
    fileType,
  }: {
    maisonMereAAPId: string;
    fileType:
      | "attestationURSSAFFile"
      | "justificatifIdentiteDirigeantFile"
      | "lettreDeDelegationFile"
      | "justificatifIdentiteDelegataireFile";
  }) => {
    const docs =
      await prismaClient.maisonMereAAPLegalInformationDocuments.findUnique({
        where: { maisonMereAAPId },
        include: {
          attestationURSSAFFile: true,
          justificatifIdentiteDelegataireFile: true,
          justificatifIdentiteDirigeantFile: true,
          lettreDeDelegationFile: true,
        },
      });
    if (!docs) {
      throw new Error("Documents d'informations légales non trouvés");
    }
    let filename = "";
    let mimeType = "";
    let filePath = "";
    switch (fileType) {
      case "attestationURSSAFFile":
        filename = docs.attestationURSSAFFile.name;
        mimeType = docs.attestationURSSAFFile.mimeType;
        filePath = docs.attestationURSSAFFile.path;
        break;
      case "justificatifIdentiteDirigeantFile":
        filename = docs.justificatifIdentiteDirigeantFile.name;
        mimeType = docs.justificatifIdentiteDirigeantFile.mimeType;
        filePath = docs.justificatifIdentiteDirigeantFile.path;
        break;
      case "lettreDeDelegationFile":
        filename = docs.lettreDeDelegationFile?.name || "";
        mimeType = docs.lettreDeDelegationFile?.mimeType || "";
        filePath = docs.lettreDeDelegationFile?.path || "";
        break;
      case "justificatifIdentiteDelegataireFile":
        filename = docs.justificatifIdentiteDelegataireFile?.name || "";
        mimeType = docs.justificatifIdentiteDelegataireFile?.mimeType || "";
        filePath = docs.justificatifIdentiteDelegataireFile?.path || "";
        break;
    }

    const url = await getDownloadLink(filePath);

    return filename
      ? {
          name: filename,
          mimeType,
          url,
          previewUrl: url?.replace(
            OOS_DOMAIN,
            FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND,
          ),
        }
      : null;
  };
