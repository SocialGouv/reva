import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

import { getCandidateLoginUrl } from "../utils/candidate.url.helpers";

export const sendLoginEmail = async (email: string) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 493,
    params: {
      candidateLoginUrl: getCandidateLoginUrl({
        candidateEmail: email,
      }),
    },
  });
