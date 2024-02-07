import mjml2html from "mjml";
import {
  formatFreeText,
  sendGenericEmail,
  templateMail,
} from "../../shared/email";
import { logger } from "../../shared/logger";

export const sendFeasibilityIncompleteMailToAAP = async ({
  email,
  feasibilityUrl,
  comment,
}: {
  email: string;
  feasibilityUrl: string;
  comment?: string;
}) => {
  const commentInfo = comment
    ? `
      <p>Voici les éléments qu'il a indiqués comme manquants :</p>
      <br/>
      <p><em>${formatFreeText(comment || "")}</em></p>
      <br/>`
    : "";

  const htmlContent = mjml2html(
    templateMail({
      content: `
      <p>Bonjour,</p>
      <p>Un dossier transmis par vos soins a été noté comme incomplet par le certificateur.</p>
     ${commentInfo}
      <p>Nous vous invitons à le compléter et à le renvoyer au certificateur dans les meilleurs délais.</p>
        `,
      labelCTA: "Accéder au dossier",
      url: feasibilityUrl,
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
  return sendGenericEmail({
    to: { email },
    htmlContent: htmlContent.html,
    subject: "Un dossier de recevabilité a été marqué comme incomplet",
  });
};
