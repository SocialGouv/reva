import { sendEmailUsingTemplate } from "../../shared/email";

export const sendDVSentToCandidateEmail = async ({
  email,
}: {
  email: string;
}) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 512,
  });
