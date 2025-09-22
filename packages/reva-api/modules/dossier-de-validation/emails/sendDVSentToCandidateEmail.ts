import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendDVSentToCandidateEmail = async ({
  email,
}: {
  email: string;
}) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 512,
  });
