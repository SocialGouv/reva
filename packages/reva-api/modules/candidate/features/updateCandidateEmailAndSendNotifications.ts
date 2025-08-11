import {
  sendPreviousEmailCandidateEmail,
  sendNewEmailCandidateEmail,
} from "@/modules/candidacy/emails";
import { updateCandidateEmail } from "@/modules/candidacy/features/updateCandidateEmail";

export const updateCandidateEmailAndSendNotifications = async ({
  previousEmail,
  newEmail,
}: {
  previousEmail: string;
  newEmail: string;
}) => {
  if (newEmail === previousEmail) {
    throw new Error(`Le précédent et le nouvel email sont identiques`);
  }

  await updateCandidateEmail({ previousEmail, newEmail });
  await sendPreviousEmailCandidateEmail({ email: previousEmail });
  await sendNewEmailCandidateEmail({ email: newEmail });
};
