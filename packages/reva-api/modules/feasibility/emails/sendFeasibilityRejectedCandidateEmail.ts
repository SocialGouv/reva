import mjml2html from "mjml";
import {
  formatFreeText,
  sendGenericEmail,
  templateMail,
} from "../../shared/email";
import { UploadedFile } from "../../shared/file";
import { logger } from "../../shared/logger";

export const sendFeasibilityRejectedCandidateEmail = async ({
  email,
  comment,
  certificationAuthorityLabel,
  infoFile,
}: {
  email: string;
  comment?: string;
  certificationAuthorityLabel: string;
  infoFile?: UploadedFile;
}) => {
  const commentInfo = comment
    ? `
        <br/>
        <p><strong>Voici les remarques faites par le certificateur</strong> (ces préconisations pourront être reprises avec votre architecte accompagnateur de parcours) :</p>
        <p><em>${formatFreeText(comment)}</em></p>
        `
    : "";

  const htmlContent = mjml2html(
    templateMail({
      content: `
        <p>Bonjour,</p>
        <br/>
        <p>Vous trouverez ci-dessous la décision du certificateur ${certificationAuthorityLabel} concernant votre dossier de faisabilité.</p>
        <p>Malheureusement, votre dossier a été jugé non recevable par le certificateur. Nous vous invitons à prendre contact avec votre architecte de parcours pour comprendre cette décision et échanger ensemble sur les suites à donner à votre parcours.</p>
        ${commentInfo}
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
    subject: "Votre dossier de faisabilité",
    attachment,
  });
};
