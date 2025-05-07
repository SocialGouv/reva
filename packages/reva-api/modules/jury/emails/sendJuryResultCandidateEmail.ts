import { sendEmailUsingTemplate } from "../../shared/email";
import { getCandidateAppUrl } from "../../candidate/utils/candidate.url.helpers";

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
