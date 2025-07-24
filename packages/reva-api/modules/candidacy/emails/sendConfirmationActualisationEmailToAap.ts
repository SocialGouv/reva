import { sendEmailUsingTemplate } from "@/modules/shared/email";

export const sendConfirmationActualisationEmailToAap = async ({
  aapEmail,
  aapLabel,
  candidateFullName,
}: {
  aapEmail: string;
  aapLabel: string;
  candidateFullName: string;
}) => {
  return sendEmailUsingTemplate({
    to: { email: aapEmail },
    templateId: 547,
    params: {
      aapLabel,
      candidateFullName,
    },
  });
};
