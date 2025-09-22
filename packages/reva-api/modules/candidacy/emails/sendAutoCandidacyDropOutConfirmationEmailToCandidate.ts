import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendAutoCandidacyDropOutConfirmationEmailToCandidate = async ({
  candidateEmail,
  candidateFullName,
}: {
  candidateEmail: string;
  candidateFullName: string;
}) =>
  sendEmailUsingTemplate({
    to: { email: candidateEmail },
    templateId: 520,
    params: {
      candidateFullName,
    },
  });
