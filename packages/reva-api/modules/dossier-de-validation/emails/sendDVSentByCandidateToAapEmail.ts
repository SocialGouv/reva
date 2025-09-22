import { getBackofficeUrl } from "@/modules/shared/email/backoffice.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendDVSentByCandidateToAapEmail = async ({
  email,
  candidacyId,
  aapName,
  candidateName,
}: {
  email: string;
  candidacyId: string;
  aapName: string;
  candidateName: string;
}) => {
  return sendEmailUsingTemplate({
    to: { email },
    templateId: 553,
    params: {
      backofficeUrl: getBackofficeUrl({
        path: `/candidacies/${candidacyId}/dossier-de-validation-aap`,
      }),
      aapName,
      candidateName,
    },
  });
};
