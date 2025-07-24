import {
  getBackofficeUrl,
  sendEmailUsingTemplate,
} from "@/modules/shared/email";

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
