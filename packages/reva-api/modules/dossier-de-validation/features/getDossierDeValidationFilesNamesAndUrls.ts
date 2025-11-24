import { getFilesNamesAndUrlsByIds } from "@/modules/shared/file/getFileNameAndUrl";

export const getDossierDeValidationFilesNamesAndUrls = async ({
  candidacyId,
  fileIds,
}: {
  candidacyId: string;
  fileIds: string[];
}) => {
  return getFilesNamesAndUrlsByIds({
    fileIds,
    buildUrl: (fileId) =>
      `${process.env.BASE_URL}/api/candidacy/${candidacyId}/dossier-de-validation/file/${fileId}`,
  });
};
