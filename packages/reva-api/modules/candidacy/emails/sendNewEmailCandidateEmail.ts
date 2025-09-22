import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendNewEmailCandidateEmail = async ({
  email,
}: {
  email: string;
}) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 499,
  });
