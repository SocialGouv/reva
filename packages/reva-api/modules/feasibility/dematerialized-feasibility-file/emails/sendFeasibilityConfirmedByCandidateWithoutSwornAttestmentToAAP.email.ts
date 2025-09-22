import { getBackofficeUrl } from "@/modules/shared/email/backoffice.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendFeasibilityConfirmedByCandidateWithoutSwornAttestmentToAAP =
  async ({
    aapEmail,
    aapName,
    candidateName,
  }: {
    aapEmail: string;
    aapName: string;
    candidateName: string;
  }) => {
    return sendEmailUsingTemplate({
      to: [{ email: aapEmail }],
      templateId: 589,
      params: {
        aapName,
        candidateName,
        backofficeUrl: getBackofficeUrl({ path: "/" }),
      },
    });
  };
