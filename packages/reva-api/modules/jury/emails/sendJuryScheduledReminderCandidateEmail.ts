import mjml2html from "mjml";
import { format } from "date-fns";

import { sendGenericEmail, templateMail } from "../../shared/email";
import { logger } from "../../shared/logger";

export const sendJuryScheduledReminderCandidateEmail = async ({
  email,
  dateOfSession,
  timeOfSession,
  addressOfSession,
}: {
  email: string;
  dateOfSession: Date;
  timeOfSession?: string;
  addressOfSession?: string;
}) => {
  const htmlContent = mjml2html(
    templateMail({
      content: `
      <p>Bonjour,</p>
      <p>Nous vous rappelons que votre passage devant un jury VAE a lieu le : </p>
      <p>${format(dateOfSession, "dd/MM/yyyy")} ${timeOfSession ? `à ${timeOfSession} ` : ``}${addressOfSession ? `à ${addressOfSession}` : ``}</p>
      <p>Votre convocation officielle, avec toutes les informations importantes, est disponible en pièce jointe dans l’e-mail qui vous a été envoyé précédemment.</p>
    `,
    }),
  );

  if (htmlContent.errors.length > 0) {
    const errorMessage = htmlContent.errors
      .map((e) => e.formattedMessage)
      .join("\n");
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  return sendGenericEmail({
    to: { email },
    htmlContent: htmlContent.html,
    subject: "N’oubliez pas votre passage en jury VAE",
  });
};
