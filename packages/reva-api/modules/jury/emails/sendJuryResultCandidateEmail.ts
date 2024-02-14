import mjml2html from "mjml";

import { sendGenericEmail, templateMail } from "../../shared/email";
import { logger } from "../../shared/logger";

const baseUrl = process.env.APP_BASE_URL || "https://vae.gouv.fr";

export const sendJuryResultCandidateEmail = async ({
  email,
}: {
  email: string;
}) => {
  const htmlContent = mjml2html(
    templateMail({
      content: `
      <p>Bonjour,</p>
      <p>Suite à votre passage devant un jury VAE, nous vous informons que vous pouvez dès à présent retrouver vos résultats en vous connectant à votre compte France VAE.</p>
    `,
      labelCTA: "Accéder à mon parcours",
      url: `${baseUrl}/app/login/`,
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
    subject: "Résultat de votre passage devant le jury",
  });
};
