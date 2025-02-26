import mjml2html from "mjml";

import {
  sendEmailUsingTemplate,
  sendGenericEmail,
  templateMail,
} from "../../shared/email";
import { logger } from "../../shared/logger";
import { getCandidateAppUrl } from "../../candidate/utils/candidate.url.helpers";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendJuryResultCandidateEmail = async ({
  email,
}: {
  email: string;
}) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_CANDIDATE_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 524,
      params: {
        candidateAppUrl: getCandidateAppUrl(),
      },
    });
  } else {
    const baseUrl = process.env.APP_BASE_URL || "https://vae.gouv.fr";

    const htmlContent = mjml2html(
      templateMail({
        content: `
      <p>Bonjour,</p>
      <p>Suite à votre passage devant un jury VAE, nous vous informons que vous pouvez dès à présent retrouver vos résultats en vous connectant à votre compte France VAE.</p>
    `,
        labelCTA: "Accéder à mon parcours",
        url: `${baseUrl}/candidat/login/`,
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
  }
};
