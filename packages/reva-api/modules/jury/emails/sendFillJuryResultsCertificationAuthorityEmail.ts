import { getBackofficeUrl } from "@/modules/shared/email/backoffice.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendFillJuryResultsCertificationAuthorityEmail = async ({
  emails,
}: {
  emails: string[];
}) =>
  sendEmailUsingTemplate({
    to: emails.map((email) => ({ email })),
    templateId: 588,
    params: {
      candidaciesUrl: getBackofficeUrl({
        path: `/candidacies/juries/?page=1&CATEGORY=PASSED`,
      }),
    },
  });
