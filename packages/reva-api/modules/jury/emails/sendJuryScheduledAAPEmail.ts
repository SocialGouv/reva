import { getBackofficeUrl } from "@/modules/shared/email/backoffice.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendJuryScheduledAAPEmail = async ({
  candidacyId,
  email,
  candidateFullName,
}: {
  candidacyId: string;
  email: string;
  candidateFullName: string;
}) => {
  return sendEmailUsingTemplate({
    to: { email },
    templateId: 541,
    params: {
      candidateFullName,
      juryUrl: getBackofficeUrl({
        path: `/candidacies/${candidacyId}/jury-aap`,
      }),
    },
  });
};
