import { prismaClient } from "../../../prisma/client";
import {
  FILE_PREVIEW_ROUTE_PATH,
  OOS_DOMAIN,
  getDownloadLink,
} from "../../shared/file";

export const getSubscriptionRequestV2FileNameUrlAndMimeType = async ({
  subscriptionRequestId,
  fileType,
}: {
  subscriptionRequestId: string;
  fileType:
    | "attestationURSSAFFile"
    | "justificatifIdentiteDirigeantFile"
    | "lettreDeDelegationFile"
    | "justificatifIdentiteDelegataireFile";
}) => {
  const sr = await prismaClient.subscriptionRequestV2.findUnique({
    where: { id: subscriptionRequestId },
    include: {
      attestationURSSAFFile: true,
      justificatifIdentiteDelegataireFile: true,
      justificatifIdentiteDirigeantFile: true,
      lettreDeDelegationFile: true,
    },
  });
  if (!sr) {
    throw new Error("Demande d'inscription non trouvée");
  }
  let filename = "";
  let mimeType = "";
  let filePath = "";
  switch (fileType) {
    case "attestationURSSAFFile":
      filename = sr.attestationURSSAFFile.name;
      mimeType = sr.attestationURSSAFFile.mimeType;
      filePath = sr.attestationURSSAFFile.path;
      break;
    case "justificatifIdentiteDirigeantFile":
      filename = sr.justificatifIdentiteDirigeantFile.name;
      mimeType = sr.justificatifIdentiteDirigeantFile.mimeType;
      filePath = sr.justificatifIdentiteDirigeantFile.path;
      break;
    case "lettreDeDelegationFile":
      filename = sr.lettreDeDelegationFile?.name || "";
      mimeType = sr.lettreDeDelegationFile?.mimeType || "";
      filePath = sr.lettreDeDelegationFile?.path || "";
      break;
    case "justificatifIdentiteDelegataireFile":
      filename = sr.justificatifIdentiteDelegataireFile?.name || "";
      mimeType = sr.justificatifIdentiteDelegataireFile?.mimeType || "";
      filePath = sr.justificatifIdentiteDelegataireFile?.path || "";
      break;
  }

  const url = (await getDownloadLink(filePath))?.replace(
    OOS_DOMAIN,
    FILE_PREVIEW_ROUTE_PATH,
  );

  return filename
    ? {
        name: filename,
        mimeType,
        url,
      }
    : null;
};
