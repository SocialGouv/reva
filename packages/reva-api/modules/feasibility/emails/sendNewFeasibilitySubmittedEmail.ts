import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendNewFeasibilitySubmittedEmail = async ({
  emails,
  feasibilityUrl,
}: {
  emails: string[];
  feasibilityUrl: string;
}) => {
  return sendEmailUsingTemplate({
    to: emails.map((email) => ({ email })),
    templateId: 568,
    params: { feasibilityUrl },
  });
};
