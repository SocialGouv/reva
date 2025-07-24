import { sendEmailUsingTemplate } from "@/modules/shared/email";

export const sendPreviousEmailCandidateEmail = async ({
  email,
}: {
  email: string;
}) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 498,
  });
