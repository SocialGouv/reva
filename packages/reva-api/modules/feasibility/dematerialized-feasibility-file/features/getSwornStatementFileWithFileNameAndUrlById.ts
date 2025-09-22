import { getDownloadLink } from "@/modules/shared/file/file.service";
import {
  FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND,
  OOS_DOMAIN,
} from "@/modules/shared/file/preview";
import { prismaClient } from "@/prisma/client";

export const getSwornStatementFileWithFileNameAndUrlById = async ({
  swornStatementFileId,
}: {
  swornStatementFileId: string;
}) => {
  const file = await prismaClient.file.findUnique({
    where: { id: swornStatementFileId },
  });

  if (!file) {
    return null;
  }

  const url = await getDownloadLink(file.path);
  return {
    name: file.name,
    mimeType: file.mimeType,
    url,
    previewUrl: url?.replace(
      OOS_DOMAIN,
      FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND,
    ),
    createdAt: file.createdAt,
  };
};
