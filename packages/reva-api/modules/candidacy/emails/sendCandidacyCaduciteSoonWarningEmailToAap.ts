import { sendEmailUsingTemplate } from "@/modules/shared/email";

export const sendCandidacyCaduciteSoonWarningEmailToAap = async ({
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
    templateId: 546,
    params: {
      aapLabel,
      candidateFullName,
    },
  });
};
