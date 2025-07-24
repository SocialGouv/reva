import { sendEmailUsingTemplate } from "@/modules/shared/email";

export const sendCandidacyIsCaduqueEmailToAap = async ({
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
    templateId: 548,
    params: {
      aapLabel,
      candidateFullName,
    },
  });
};
