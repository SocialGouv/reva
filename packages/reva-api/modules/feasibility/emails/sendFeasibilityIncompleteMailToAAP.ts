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
      <p>Commentaire du certificateur :</p>
      <p><em>${formatFreeText(comment || "")}</em></p>
      `
    : "";

  const htmlContent = mjml2html(
    templateMail({
      content: `
        <p>Bonjour,</p>
        <p>L’un des dossiers que vous avez transmis est considéré comme incomplet par le certificateur.</p>
       ${commentInfo}
      `,
      labelCTA: "Accéder au dossier",
      url: feasibilityUrl,
      bottomLine: `
        <p>Nous vous invitons à renvoyer l'intégralité des pièces nécessaires au traitement de la recevabilité. N’oubliez pas d’y joindre les éléments manquants relevés par le certificateur.</p>
        <p>Pour toute aide ou question, écrivez-nous à <a href="mailto:support@vae.gouv.fr">support@vae.gouv.fr</a></p>
        <p>Cordialement,</p>
        <p>L’équipe France VAE</p>
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
