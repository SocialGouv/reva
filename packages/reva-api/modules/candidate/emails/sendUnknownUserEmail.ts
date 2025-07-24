import { sendEmailUsingTemplate } from "@/modules/shared/email";

export const sendUnknownUserEmail = async (email: string) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 494,
  });
