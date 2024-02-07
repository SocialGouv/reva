import mjml2html from "mjml";
import { sendGenericEmail, templateMail } from "../../shared/email";
import { logger } from "../../shared/logger";

export const sendFeasibilityDecisionTakenToAAPEmail = async ({
  email,
  feasibilityUrl,
}: {
  email: string;
  feasibilityUrl: string;
}) => {
  const htmlContent = mjml2html(
    templateMail({
      content: `
      <p>Bonjour,</p>
      <br/>
      <p>Un nouvel avis de recevabilité est disponible via le lien ci-dessous.</p>
      `,
      labelCTA: "Accéder à la notification de recevabilité",
      url: feasibilityUrl,
      bottomLine:
        "<p>En cas de dossier recevable, vous disposez d'un délai de deux mois pour renseigner <b>la date prévisionnelle</b> à laquelle le candidat sera potentiellement prêt pour son passage devant le jury.</p>",
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
    subject: "Un nouvel avis de recevabilité est disponible",
  });
};
