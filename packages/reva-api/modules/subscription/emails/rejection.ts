import { sendEmailUsingTemplate } from "../../shared/email";

export const sendRejectionEmail = async ({
  email,
  reason,
}: {
  email: string;
  reason: string;
}) => {
  return sendEmailUsingTemplate({
    to: { email },
    templateId: 561,
    params: { reason },
  });
};
