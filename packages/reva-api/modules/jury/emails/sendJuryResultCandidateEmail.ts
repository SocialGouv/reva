import { getCandidateAppUrl } from "@/modules/candidate/utils/candidate.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendJuryResultCandidateEmail = async ({
  email,
}: {
  email: string;
}) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 524,
    params: {
      candidateAppUrl: getCandidateAppUrl(),
    },
  });
