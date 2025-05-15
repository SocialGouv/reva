import { sendEmailUsingTemplate } from "../../shared/email";

export const notifyNewEmailAddress = async ({ email }: { email: string }) => {
  return sendEmailUsingTemplate({
    to: { email },
    templateId: 560,
  });
};
