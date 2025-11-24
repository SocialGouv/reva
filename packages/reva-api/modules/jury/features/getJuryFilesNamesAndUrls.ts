import { getFilesNamesAndUrlsByIds } from "@/modules/shared/file/getFileNameAndUrl";

export const getJuryFilesNamesAndUrls = async ({
  candidacyId,
  fileIds,
}: {
  candidacyId: string;
  fileIds: string[];
}) => {
  return getFilesNamesAndUrlsByIds({
    fileIds,
    buildUrl: (fileId) =>
      `${process.env.BASE_URL}/api/candidacy/${candidacyId}/jury/file/${fileId}`,
  });
};
