import { sendNewEmailCandidateEmail } from "@/modules/candidacy/emails/sendNewEmailCandidateEmail";
import { sendPreviousEmailCandidateEmail } from "@/modules/candidacy/emails/sendPreviousEmailCandidateEmail";
import { updateCandidateEmail } from "@/modules/candidacy/features/updateCandidateEmail";

export const updateCandidateEmailAndSendNotifications = async ({
  previousEmail,
  newEmail,
}: {
  previousEmail: string;
  newEmail: string;
}) => {
  if (newEmail === previousEmail) {
    throw new Error(
      `La précédente et la nouvelle adresse électroniques sont identiques`,
    );
  }

  await updateCandidateEmail({ previousEmail, newEmail });
  await sendPreviousEmailCandidateEmail({ email: previousEmail });
  await sendNewEmailCandidateEmail({ email: newEmail });
};
