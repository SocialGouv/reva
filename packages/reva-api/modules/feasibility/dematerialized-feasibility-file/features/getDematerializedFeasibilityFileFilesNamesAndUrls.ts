import { getDownloadLink } from "@/modules/shared/file/file.service";
import {
  FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND,
  OOS_DOMAIN,
} from "@/modules/shared/file/preview";
import { prismaClient } from "@/prisma/client";

export const getDematerializedFeasibilityFileAttachmentsFilesNamesAndUrls =
  async ({
    dematerializedFeasibilityFileId,
  }: {
    dematerializedFeasibilityFileId: string;
  }) => {
    const dffAttachmentsWithFiles = await prismaClient.dFFAttachment.findMany({
      where: { dematerializedFeasibilityFileId },
      include: {
        file: true,
      },
    });

    const dffAttachmentsFiles = dffAttachmentsWithFiles.map(
      async (dffAttachment) => {
        const url = await getDownloadLink(dffAttachment.file.path);
        return {
          ...dffAttachment,
          file: {
            name: dffAttachment.file.name,
            mimeType: dffAttachment.file.mimeType,
            url,
            previewUrl: url?.replace(
              OOS_DOMAIN,
              FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND,
            ),
          },
        };
      },
    );
    return dffAttachmentsFiles;
  };
