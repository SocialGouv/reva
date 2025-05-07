import { sendEmailUsingTemplate } from "../../../shared/email";
import { getCandidateAppUrl } from "../../../candidate/utils/candidate.url.helpers";

export const sendDFFNotificationToCandidateEmail = async ({
  email,
}: {
  email: string;
}) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 521,
    params: {
      candidateAppUrl: getCandidateAppUrl(),
    },
  });
