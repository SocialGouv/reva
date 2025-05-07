import { sendEmailUsingTemplate } from "../../shared/email";

export const sendNewEmailCandidateEmail = async ({
  email,
}: {
  email: string;
}) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 499,
  });
