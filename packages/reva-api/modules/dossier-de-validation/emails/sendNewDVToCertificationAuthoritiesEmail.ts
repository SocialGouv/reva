import {
  getBackofficeUrl,
  sendEmailUsingTemplate,
} from "@/modules/shared/email";

export const sendNewDVToCertificationAuthoritiesEmail = async ({
  emails,
  candidacyId,
}: {
  emails: string[];
  candidacyId: string;
}) => {
  const dossierDeValidationUrl = getBackofficeUrl({
    path: `/candidacies/${candidacyId}/dossier-de-validation`,
  });

  return sendEmailUsingTemplate({
    to: emails.map((email) => ({ email })),
    templateId: 569,
    params: { dossierDeValidationUrl },
  });
};
