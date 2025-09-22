import { getCandidateLoginUrl } from "@/modules/candidate/utils/candidate.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendTrainingEmail = async (email: string) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 495,
    params: {
      candidateLoginUrl: getCandidateLoginUrl({ candidateEmail: email }),
    },
  });
