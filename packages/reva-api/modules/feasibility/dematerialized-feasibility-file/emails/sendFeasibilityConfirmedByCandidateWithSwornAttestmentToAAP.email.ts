import {
  getBackofficeUrl,
  sendEmailUsingTemplate,
} from "../../../shared/email";

export const sendFeasibilityConfirmedByCandidateWithSwornAttestmentToAAP =
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
      templateId: 594,
      params: {
        aapName,
        candidateName,
        backofficeUrl: getBackofficeUrl({ path: "/" }),
      },
    });
  };
