import { getCandidateAppUrl } from "@/modules/candidate/utils/candidate.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email";

export const sendCandidacyCaduciteSoonWarningEmailToCandidate = async ({
  candidateEmail,
  candidateFullName,
  dateThresholdWillBeCaduque,
}: {
  candidateEmail: string;
  candidateFullName: string;
  dateThresholdWillBeCaduque: string;
}) =>
  sendEmailUsingTemplate({
    to: { email: candidateEmail },
    templateId: 507,
    params: {
      candidateFullName,
      dateThresholdWillBeCaduque,
      candidateAppUrl: getCandidateAppUrl(),
    },
  });
