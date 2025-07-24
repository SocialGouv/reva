import { getCandidateAppUrl } from "../../candidate/utils/candidate.url.helpers";
import { sendEmailUsingTemplate } from "../../shared/email";

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
