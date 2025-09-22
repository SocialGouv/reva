import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendConfirmationCandidacySubmissionEmail = async ({
  email,
  organismName,
  organismEmail,
}: {
  email: string;
  organismName: string;
  organismEmail: string;
}) => {
  return sendEmailUsingTemplate({
    to: { email },
    templateId: 597,
    params: {
      organismName,
      organismEmail,
    },
  });
};
