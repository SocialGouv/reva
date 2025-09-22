import { getDownloadLink } from "@/modules/shared/file/file.service";
import {
  FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND,
  OOS_DOMAIN,
} from "@/modules/shared/file/preview";
import { prismaClient } from "@/prisma/client";

export const getFilesNamesAndUrls = async ({
  candidacyId,
  fileIds,
}: {
  candidacyId: string;
  fileIds: string[];
}) => {
  if (fileIds.length) {
    const files = await prismaClient.file.findMany({
      where: { id: { in: fileIds } },
    });

    return files.map(async (file) => {
      const downloadUrl = await getDownloadLink(file.path);

      const previewUrl = downloadUrl?.replace(
        OOS_DOMAIN,
        FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND,
      );

      return {
        name: file.name,
        mimeType: file.mimeType,
        url: file
          ? `${process.env.BASE_URL}/api/candidacy/${candidacyId}/jury/file/${file.id}`
          : "",
        previewUrl,
        createdAt: file.createdAt,
      };
    });
  } else {
    return [];
  }
};
