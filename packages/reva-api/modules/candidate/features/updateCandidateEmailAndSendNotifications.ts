import {
  sendPreviousEmailCandidateEmail,
  sendNewEmailCandidateEmail,
} from "../../candidacy/emails";
import { updateCandidateEmail } from "../../candidacy/features/updateCandidateEmail";

export const updateCandidateEmailAndSendNotifications = async ({
  previousEmail,
  newEmail,
}: {
  previousEmail: string;
  newEmail: string;
}) => {
  if (newEmail && newEmail !== previousEmail) {
    await updateCandidateEmail({ previousEmail, newEmail });
    await sendPreviousEmailCandidateEmail({ email: previousEmail });
    await sendNewEmailCandidateEmail({ email: newEmail });
  }
};
