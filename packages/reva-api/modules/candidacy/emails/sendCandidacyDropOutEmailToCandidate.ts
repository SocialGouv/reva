import { sendEmailUsingTemplate } from "../../shared/email";
import { getCandidateLoginUrl } from "../../candidate/utils/candidate.url.helpers";

export const sendCandidacyDropOutEmailToCandidate = async (email: string) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 491,
    params: {
      candidateLoginUrl: getCandidateLoginUrl({ candidateEmail: email }),
    },
  });
