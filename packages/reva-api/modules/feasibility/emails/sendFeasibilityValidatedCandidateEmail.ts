import mjml2html from "mjml";
import {
  formatFreeText,
  sendGenericEmail,
  templateMail,
} from "../../shared/email";
import { UploadedFile } from "../../shared/file";
import { logger } from "../../shared/logger";

export const sendFeasibilityValidatedCandidateEmail = async ({
  email,
  comment,
  certifName,
  certificationAuthorityLabel,
  infoFile,
}: {
  email: string;
  comment?: string;
  certifName: string;
  certificationAuthorityLabel: string;
  infoFile?: UploadedFile;
}) => {
  const commentInfo = comment
    ? `
        <br/>
        <p><strong>Pour votre information, voici les remarques faites par le certificateur :</strong></p>
        <p><em>${formatFreeText(comment)}</em></p>
        `
    : "";
  const htmlContent = mjml2html(
    templateMail({
      content: `
      <p>Bonjour,</p>
      <br/>
      <p>Vous trouverez ci-dessous la décision de recevabilité du certificateur ${certificationAuthorityLabel} concernant votre dossier de faisabilité pour la certification <em>${certifName}</em>.</p>
      <p>Félicitations, votre dossier a été jugé recevable par le certificateur et vous pouvez désormais démarrer votre parcours VAE. Nous vous invitons à prendre contact avec votre architecte de parcours afin d’organiser la suite.</p>
      ${commentInfo}
      <br/>
      <p><strong>Attention</strong></p>
      <p>Si un relevé de recevabilité est joint à ce mail, nous vous conseillons de le télécharger et de le conserver. Pour rappel, vous pouvez aussi le retrouver dans votre compte candidat.</p>
    `,
      hideFranceVaeLogo: true,
    }),
  );

  if (htmlContent.errors.length > 0) {
    const errorMessage = htmlContent.errors
      .map((e) => e.formattedMessage)
      .join("\n");
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  if (process.env.NODE_ENV !== "production") {
    logger.info("======= EMAIL CONTENT =======");
    logger.info(htmlContent.html);
    logger.info("=========================");
  }

  const attachment = infoFile
    ? [{ name: infoFile.filename, content: infoFile._buf.toString("base64") }]
    : undefined;

  return sendGenericEmail({
    to: { email },
    htmlContent: htmlContent.html,
    subject: "Votre dossier de faisabilité VAE a été examiné",
    attachment,
  });
};
