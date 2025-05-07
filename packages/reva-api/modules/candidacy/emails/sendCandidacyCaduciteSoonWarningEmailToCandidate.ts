import { sendEmailUsingTemplate } from "../../shared/email";
import { getCandidateAppUrl } from "../../candidate/utils/candidate.url.helpers";

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
