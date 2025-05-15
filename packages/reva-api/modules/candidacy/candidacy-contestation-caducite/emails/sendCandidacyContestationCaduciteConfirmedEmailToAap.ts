import { sendEmailUsingTemplate } from "../../../shared/email";

export const sendCandidacyContestationCaduciteConfirmedEmailToAap = async ({
  candidateFullName,
  aapLabel,
  aapEmail,
}: {
  candidateFullName: string;
  aapLabel: string;
  aapEmail: string;
}) => {
  return sendEmailUsingTemplate({
    to: { email: aapEmail },
    templateId: 549,
    params: {
      aapLabel,
      candidateFullName,
    },
  });
};
