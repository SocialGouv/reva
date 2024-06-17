import { prismaClient } from "../../../prisma/client";
import {
  FILE_PREVIEW_ROUTE_PATH,
  OOS_DOMAIN,
  getDownloadLink,
} from "../../shared/file";

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
            previewUrl: url?.replace(OOS_DOMAIN, FILE_PREVIEW_ROUTE_PATH),
          },
        };
      },
    );
    return dffAttachmentsFiles;
  };
