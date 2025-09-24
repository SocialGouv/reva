import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendEndAccompagnementSubmittedToCandidate = async ({
  email,
  candidateFullName,
  candidateLoginUrl,
}: {
  email: string;
  candidateFullName: string;
  candidateLoginUrl: string;
}) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 637,
    params: { candidateFullName, candidateLoginUrl },
  });
