import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendPreviousEmailCandidateEmail = async ({
  email,
}: {
  email: string;
}) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 498,
  });
