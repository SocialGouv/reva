import { sendEmailUsingTemplate } from "../../shared/email";

export const sendFeasibilityIncompleteMailToAAP = async ({
  email,
  feasibilityUrl,
  comment,
}: {
  email: string;
  feasibilityUrl: string;
  comment?: string;
}) => {
  return sendEmailUsingTemplate({
    to: { email },
    templateId: 535,
    params: {
      feasibilityUrl,
      comment: comment || "",
    },
  });
};
