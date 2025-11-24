import { getDownloadLink } from "@/modules/shared/file/file.service";
import {
  FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND,
  OOS_DOMAIN,
} from "@/modules/shared/file/preview";
import { prismaClient } from "@/prisma/client";

export const getDffFileNameAndUrl = async ({
  dematerializedFeasibilityFileId,
}: {
  dematerializedFeasibilityFileId: string;
}) => {
  const dematerializedFeasibilityFile =
    await prismaClient.dematerializedFeasibilityFile.findUnique({
      where: { id: dematerializedFeasibilityFileId },
      select: {
        feasibilityFile: true,
        feasibility: {
          select: {
            candidacyId: true,
          },
        },
      },
    });

  const feasibilityFile = dematerializedFeasibilityFile?.feasibilityFile;
  const candidacyId = dematerializedFeasibilityFile?.feasibility.candidacyId;

  if (!feasibilityFile || !candidacyId) {
    return null;
  }

  const downloadUrl = await getDownloadLink({
    filePath: feasibilityFile.path,
    filename: feasibilityFile.name,
  });

  return {
    id: feasibilityFile.id,
    createdAt: feasibilityFile.createdAt,
    name: feasibilityFile.name,
    mimeType: feasibilityFile.mimeType,
    url: `${process.env.BASE_URL}/api/candidacy/${candidacyId}/feasibility/file/${feasibilityFile.id}`,
    previewUrl: downloadUrl?.replace(
      OOS_DOMAIN,
      FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND,
    ),
  };
};
