import mjml2html from "mjml";
import { format } from "date-fns";

import { sendGenericEmail, templateMail } from "../../shared/email";
import { logger } from "../../shared/logger";

const baseUrl = process.env.ELM_ADMIN_BASE_URL || "https://vae.gouv.fr";

export const sendJuryScheduledAAPEmail = async ({
  candidacyId,
  email,
  candidateFullName,
  dateOfSession,
  timeOfSession,
}: {
  candidacyId: string;
  email: string;
  candidateFullName: string;
  dateOfSession: Date;
  timeOfSession?: string;
}) => {
  const htmlContent = mjml2html(
    templateMail({
      content: `
      <p>Bonjour,</p>
      <p>La convocation pour votre candidat ${candidateFullName} a été émise.</p>
      <p>Voici la date de son passage devant un jury VAE :</p>
      <p>${format(dateOfSession, "dd/MM/yyyy")} ${timeOfSession ? `à ${timeOfSession} ` : ``}</p>
    `,
      labelCTA: "Accéder aux informations jury",
      url: `${baseUrl}/admin/candidacies/${candidacyId}/jury/date`,
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
    subject: "Convocation de passage en jury VAE pour un de vos candidats",
  });
};
