import { prismaClient } from "../../../../prisma/client";
import {
  FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND,
  OOS_DOMAIN,
  getDownloadLink,
} from "../../../shared/file";

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
  };
};
