import { sendEmailUsingTemplate } from "../../shared/email";

export const sendPreviousEmailCandidateEmail = async ({
  email,
}: {
  email: string;
}) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 498,
  });
