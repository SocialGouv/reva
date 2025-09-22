import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendSubscriptionRequestCreatedEmail = async ({
  email,
}: {
  email: string;
}) => {
  return sendEmailUsingTemplate({
    to: { email },
    templateId: 554,
  });
};
