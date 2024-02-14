import mjml2html from "mjml";
import { format } from "date-fns";

import { sendGenericEmail, templateMail } from "../../shared/email";
import { UploadedFile } from "../../shared/file";
import { logger } from "../../shared/logger";

export const sendJuryScheduledCandidateEmail = async ({
  email,
  dateOfSession,
  timeOfSession,
  addressOfSession,
  convocationFile,
}: {
  email: string;
  dateOfSession: Date;
  timeOfSession?: string;
  addressOfSession?: string;
  convocationFile?: UploadedFile;
}) => {
  const htmlContent = mjml2html(
    templateMail({
      content: `
      <p>Bonjour,</p>
      <p>Voici la date de votre passage devant un jury VAE : </p>
      <p>${format(dateOfSession, "dd/MM/yyyy")} ${timeOfSession ? `à ${timeOfSession} ` : ``}${addressOfSession ? `à ${addressOfSession}` : ``}</p>
      <p>${convocationFile ? "Vous trouverez toutes les informations importantes dans la convocation officielle disponible en pièce jointe de cet e-mail." : "Le certificateur vous fera parvenir la convocation officielle par courrier. Vous y trouverez toutes les informations importantes et tous les détails nécessaires."}</p>
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

  const attachment = convocationFile
    ? [
        {
          name: convocationFile.filename,
          content: convocationFile._buf.toString("base64"),
        },
      ]
    : undefined;

  return sendGenericEmail({
    to: { email },
    htmlContent: htmlContent.html,
    subject: "Convocation de passage devant un jury VAE",
    attachment,
  });
};
