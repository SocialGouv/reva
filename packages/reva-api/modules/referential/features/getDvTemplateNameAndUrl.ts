import {
  getDownloadLink,
  OOS_DOMAIN,
  FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND,
} from "../../../modules/shared/file";
import { prismaClient } from "../../../prisma/client";

export const getFileNameAndUrl = async ({ fileId }: { fileId: string }) => {
  if (fileId) {
    const file = await prismaClient.file.findFirst({
      where: { id: fileId },
      select: { name: true, path: true, mimeType: true },
    });

    if (!file) {
      throw new Error("Fichier non trouvé");
    }
    const downloadUrl = await getDownloadLink(file?.path);

    return {
      name: file?.name || "",
      url: downloadUrl,
      previewUrl: downloadUrl?.replace(
        OOS_DOMAIN,
        FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND,
      ),
      mimeType: file?.mimeType || "",
    };
  } else {
    return null;
  }
};
