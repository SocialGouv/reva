import { sendEmailUsingTemplate } from "@/modules/shared/email";

export const sendCandidacyContestationCaduciteConfirmedEmailToCandidate =
  async ({
    candidateFullName,
    candidateEmail,
  }: {
    candidateFullName: string;
    candidateEmail: string;
  }) =>
    sendEmailUsingTemplate({
      to: { email: candidateEmail },
      templateId: 510,
      params: {
        candidateFullName,
      },
    });
