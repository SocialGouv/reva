import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const notifyNewEmailAddress = async ({ email }: { email: string }) => {
  return sendEmailUsingTemplate({
    to: { email },
    templateId: 560,
  });
};
