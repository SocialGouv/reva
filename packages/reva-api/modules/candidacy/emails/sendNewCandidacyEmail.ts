import { getBackofficeUrl } from "@/modules/shared/email/backoffice.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendNewCandidacyEmail = async ({
  email,
  candidacyId,
}: {
  email: string;
  candidacyId: string;
}) => {
  return sendEmailUsingTemplate({
    to: { email },
    templateId: 533,
    params: {
      backofficeUrl: getBackofficeUrl({
        path: `/candidacies/${candidacyId}/summary/`,
      }),
    },
  });
};
