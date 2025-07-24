import { getCandidateLoginUrl } from "../../../candidate/utils/candidate.url.helpers";
import { sendEmailUsingTemplate } from "../../../shared/email";

export const sendTrainingEmail = async (email: string) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 495,
    params: {
      candidateLoginUrl: getCandidateLoginUrl({ candidateEmail: email }),
    },
  });
