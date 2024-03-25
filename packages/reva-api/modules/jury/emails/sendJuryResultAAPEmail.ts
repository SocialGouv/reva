import mjml2html from "mjml";

import { sendGenericEmail, templateMail } from "../../shared/email";
import { logger } from "../../shared/logger";

const baseUrl =
  process.env.ELM_ADMIN_BASE_URL ||
  process.env.APP_BASE_URL ||
  "https://vae.gouv.fr";

export const sendJuryResultAAPEmail = async ({
  candidacyId,
  email,
  candidateFullName,
}: {
  candidacyId: string;
  email: string;
  candidateFullName: string;
}) => {
  const htmlContent = mjml2html(
    templateMail({
      content: `
      <p>Bonjour,</p>
      <p>Nous vous informons que, suite à son passage devant un jury VAE, les résultats de votre candidat ${candidateFullName} ont été renseignés par le certificateur. Ils sont dès à présent consultables depuis votre Espace professionnel sous la rubrique “Jury”.</p>
    `,
      labelCTA: "Accéder aux informations jury",
      url: `${baseUrl}/admin/candidacies/${candidacyId}/jury/result`,
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
    subject: "Résultat de passage en jury VAE pour un de vos candidats",
  });
};
