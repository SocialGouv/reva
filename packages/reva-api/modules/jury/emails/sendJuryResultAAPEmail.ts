import { getBackofficeUrl } from "@/modules/shared/email/backoffice.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendJuryResultAAPEmail = async ({
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
    templateId: 542,
    params: {
      candidateFullName,
      juryUrl: getBackofficeUrl({
        path: `/candidacies/${candidacyId}/jury-aap`,
      }),
    },
  });
};
