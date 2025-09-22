import { prismaClient } from "@/prisma/client";

import { getDownloadLink } from "./file.service";
import { FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND, OOS_DOMAIN } from "./preview";

export const getFileNameAndUrl = async ({ fileId }: { fileId: string }) => {
  if (fileId) {
    const file = await prismaClient.file.findUnique({
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
