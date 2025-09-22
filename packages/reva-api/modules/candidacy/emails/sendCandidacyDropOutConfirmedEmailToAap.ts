import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendCandidacyDropOutConfirmedEmailToAap = async ({
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
    templateId: 550,
    params: {
      aapLabel,
      candidateFullName,
    },
  });
};
