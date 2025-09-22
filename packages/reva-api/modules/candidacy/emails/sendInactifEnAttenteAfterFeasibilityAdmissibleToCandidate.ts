import { getCandidateLoginUrl } from "@/modules/candidate/utils/candidate.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendInactifEnAttenteAfterFeasibilityAdmissibleToCandidate =
  async ({
    candidateEmail,
    thresholdDateInactifConfirme,
    candidateFullName,
  }: {
    candidateEmail: string;
    thresholdDateInactifConfirme: string;
    candidateFullName: string;
  }) =>
    sendEmailUsingTemplate({
      to: { email: candidateEmail },
      templateId: 629,
      params: {
        candidateLoginUrl: getCandidateLoginUrl({
          candidateEmail,
          jwtValidity: 1 * 60 * 60 * 24 * 15, // 15 days
        }),
        thresholdDateInactifConfirme,
        candidateFullName,
      },
    });
