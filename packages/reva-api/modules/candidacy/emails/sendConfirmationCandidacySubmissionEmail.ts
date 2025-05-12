import { sendEmailUsingTemplate } from "../../shared/email";

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
