import mjml2html from "mjml";

import { sendEmailWithLink, templateMail } from "../../shared/email";
import { UploadedFile } from "../../shared/file";

export const sendJuryScheduledCandidateEmail = async ({
  email,
  convocationFile,
}: {
  email: string;
  convocationFile?: UploadedFile;
}) => {
  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        content: `
      <p>Bonjour,</p>
      <p>La date de votre passage devant un jury VAE a été planifiée et est disponible dans votre espace candidat.</p>
    `,
        labelCTA: "Accéder à mon espace",
        bottomLine: `
      <p>${
        convocationFile
          ? "Vous trouverez toutes les informations importantes dans la convocation officielle disponible en pièce jointe de cet e-mail."
          : "Le certificateur vous fera parvenir la convocation officielle par courrier. Vous y trouverez toutes les informations importantes et tous les détails nécessaires."
      }</p>
      <p>L'équipe France VAE.</p>
        `,
        url,
      }),
    );

  const attachment = convocationFile
    ? [
        {
          name: convocationFile.filename,
          content: convocationFile._buf.toString("base64"),
        },
      ]
    : undefined;

  return sendEmailWithLink({
    to: { email },
    htmlContent,
    subject: "Convocation de passage devant un jury VAE",
    attachment,
    app: "app",
  });
};
