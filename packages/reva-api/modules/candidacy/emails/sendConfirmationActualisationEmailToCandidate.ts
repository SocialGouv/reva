import { sendEmailUsingTemplate } from "../../shared/email";

export const sendConfirmationActualisationEmailToCandidate = async ({
  candidateEmail,
  candidateFullName,
}: {
  candidateEmail: string;
  candidateFullName: string;
}) =>
  sendEmailUsingTemplate({
    to: { email: candidateEmail },
    templateId: 509,
    params: {
      candidateFullName,
    },
  });
