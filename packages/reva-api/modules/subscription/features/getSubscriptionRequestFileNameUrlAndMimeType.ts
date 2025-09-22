import { getDownloadLink } from "@/modules/shared/file/file.service";
import {
  FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND,
  OOS_DOMAIN,
} from "@/modules/shared/file/preview";
import { prismaClient } from "@/prisma/client";

export const getSubscriptionRequestFileNameUrlAndMimeType = async ({
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
  const sr = await prismaClient.subscriptionRequest.findUnique({
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
      filename = sr.attestationURSSAFFile?.name || "";
      mimeType = sr.attestationURSSAFFile?.mimeType || "";
      filePath = sr.attestationURSSAFFile?.path || "";
      break;
    case "justificatifIdentiteDirigeantFile":
      filename = sr.justificatifIdentiteDirigeantFile?.name || "";
      mimeType = sr.justificatifIdentiteDirigeantFile?.mimeType || "";
      filePath = sr.justificatifIdentiteDirigeantFile?.path || "";
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
    FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND,
  );

  return filename
    ? {
        name: filename,
        mimeType,
        url,
      }
    : null;
};
