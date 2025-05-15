import { sendEmailUsingTemplate } from "../../../shared/email";

export const sendCandidacyContestationCaduciteInvalidatedEmailToAap = async ({
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
    templateId: 556,
    params: {
      aapLabel,
      candidateFullName,
    },
  });
};
