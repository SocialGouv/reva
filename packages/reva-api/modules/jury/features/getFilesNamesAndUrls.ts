import { prismaClient } from "../../../prisma/client";

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
      select: { name: true, id: true },
    });
    return files.map((f) => ({
      name: f?.name || "",
      url: f
        ? `${process.env.BASE_URL}/api/candidacy/${candidacyId}/jury/file/${f.id}`
        : "",
    }));
  } else {
    return [];
  }
};
