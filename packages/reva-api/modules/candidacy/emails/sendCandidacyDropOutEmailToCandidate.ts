import { getCandidateLoginUrl } from "@/modules/candidate/utils/candidate.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendCandidacyDropOutEmailToCandidate = async (email: string) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 491,
    params: {
      candidateLoginUrl: getCandidateLoginUrl({ candidateEmail: email }),
    },
  });
