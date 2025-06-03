import { sendEmailUsingTemplate } from "../../shared/email";

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
