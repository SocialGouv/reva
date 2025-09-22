import { getBackofficeUrl } from "@/modules/shared/email/backoffice.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

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
