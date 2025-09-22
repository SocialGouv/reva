import { getCandidateAppUrl } from "@/modules/candidate/utils/candidate.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

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
