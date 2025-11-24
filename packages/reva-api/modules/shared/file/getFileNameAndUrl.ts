import { prismaClient } from "@/prisma/client";

import { getDownloadLink } from "./file.service";
import { FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND, OOS_DOMAIN } from "./preview";

export const getFileNameAndUrl = async ({ fileId }: { fileId: string }) => {
  if (!fileId) {
    return null;
  }

  const file = await prismaClient.file.findUnique({
    where: { id: fileId },
    select: { name: true, path: true, mimeType: true },
  });

  if (!file) {
    throw new Error("Fichier non trouvé");
  }

  const downloadUrl = await getDownloadLink({
    filePath: file.path,
    filename: file.name,
  });

  return {
    name: file.name || "",
    url: downloadUrl,
    previewUrl: downloadUrl?.replace(
      OOS_DOMAIN,
      FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND,
    ),
    mimeType: file.mimeType || "",
  };
};

type FileDescriptor = {
  name: string;
  mimeType: string;
  url: string;
  previewUrl?: string;
  createdAt: Date;
};

export const getFilesNamesAndUrlsByIds = async ({
  fileIds,
  buildUrl,
}: {
  fileIds: string[];
  buildUrl: (fileId: string) => string;
}): Promise<FileDescriptor[]> => {
  if (!fileIds.length) {
    return [];
  }

  const files = await prismaClient.file.findMany({
    where: { id: { in: fileIds } },
  });

  return Promise.all(
    files.map(async (file) => {
      const downloadUrl = await getDownloadLink({
        filePath: file.path,
        filename: file.name,
      });

      return {
        name: file.name,
        mimeType: file.mimeType,
        url: buildUrl(file.id),
        previewUrl: downloadUrl?.replace(
          OOS_DOMAIN,
          FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND,
        ),
        createdAt: file.createdAt,
      };
    }),
  );
};
