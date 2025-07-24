import { getCandidateAppUrl } from "../../candidate/utils/candidate.url.helpers";
import { sendEmailUsingTemplate } from "../../shared/email";

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
