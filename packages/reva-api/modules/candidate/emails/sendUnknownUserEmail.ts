import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendUnknownUserEmail = async (email: string) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 494,
  });
