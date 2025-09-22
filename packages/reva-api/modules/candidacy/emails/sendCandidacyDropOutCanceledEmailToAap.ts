import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendCandidacyDropOutCanceledEmailToAap = async ({
  aapEmail,
  aapLabel,
  candidateFullName,
  candidacyUrl,
}: {
  aapEmail: string;
  aapLabel: string;
  candidateFullName: string;
  candidacyUrl: string;
}) => {
  return sendEmailUsingTemplate({
    to: { email: aapEmail },
    templateId: 631,
    params: {
      aapLabel,
      candidateFullName,
      candidacyUrl,
    },
  });
};
