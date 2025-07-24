import { getCandidateAppUrl } from "../../candidate/utils/candidate.url.helpers";
import { sendEmailUsingTemplate } from "../../shared/email";

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
