import { sendEmailUsingTemplate } from "../../shared/email";

export const sendAutoCandidacyDropOutConfirmationEmailToAap = async ({
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
    templateId: 551,
    params: {
      aapLabel,
      candidateFullName,
    },
  });
};
