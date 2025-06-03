import { sendEmailUsingTemplate } from "../../shared/email";

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
