import { sendEmailUsingTemplate } from "@/modules/shared/email";

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
