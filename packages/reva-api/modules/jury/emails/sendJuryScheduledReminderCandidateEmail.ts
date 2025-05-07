import { sendEmailUsingTemplate } from "../../shared/email";
import { getCandidateAppUrl } from "../../candidate/utils/candidate.url.helpers";

export const sendJuryScheduledReminderCandidateEmail = async ({
  email,
}: {
  email: string;
}) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 525,
    params: {
      candidateAppUrl: getCandidateAppUrl(),
    },
  });
