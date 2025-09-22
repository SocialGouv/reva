import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendFeasibilityDecisionTakenToAAPEmail = async ({
  email,
  feasibilityUrl,
}: {
  email: string;
  feasibilityUrl: string;
}) => {
  return sendEmailUsingTemplate({
    to: { email },
    templateId: 536,
    params: { feasibilityUrl },
  });
};
