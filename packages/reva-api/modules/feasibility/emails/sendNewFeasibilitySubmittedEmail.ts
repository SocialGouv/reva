import mjml2html from "mjml";
import { sendGenericEmail, templateMail } from "../../shared/email";
import { logger } from "../../shared/logger";

export const sendNewFeasibilitySubmittedEmail = async ({
  emails,
  feasibilityUrl,
}: {
  emails: string[];
  feasibilityUrl: string;
}) => {
  const htmlContent = mjml2html(
    templateMail({
      content: `
          <p>Bonjour,</p><p>Un nouveau dossier de faisabilité vous a été transmis. Vous pouvez y accéder dès maintenant en cliquant sur le bouton ci-dessous.</p>
          <p>Nous vous rappelons que, dans le cadre d’une bonne administration de service public, vous disposez d’un délai de 15 jours pour prononcer la recevabilité du dossier.</p>
          <p>L'équipe France VAE.</p>
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
    logger.info("======= RECIPIENTS =======");
    logger.info(emails.join(", "));
    logger.info("======= EMAIL CONTENT =======");
    logger.info(htmlContent.html);
    logger.info("=========================");
  }
  return sendGenericEmail({
    to: emails.map((email) => ({ email })),
    htmlContent: htmlContent.html,
    subject: "Un nouveau dossier de faisabilité est en attente",
  });
};
