import mjml2html from "mjml";

import {
  getBackofficeUrl,
  sendEmailUsingTemplate,
  sendEmailWithLink,
  templateMail,
} from "../../shared/email";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendNewCandidacyEmail = async ({
  email,
  candidacyId,
}: {
  email: string;
  candidacyId: string;
}) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_ORGANISM_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 533,
      params: {
        backofficeUrl: getBackofficeUrl({
          path: `/candidacies/${candidacyId}/summary/`,
        }),
      },
    });
  }

  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        headlineDsfr: `<div>Une nouvelle candidature est arrivée</div>`,
        content: `
        <mj-text font-size="16px" font-family="helvetica">
          <p>Bonjour,</p>
          <p>Une nouvelle candidature VAE est disponible dans votre espace de travail.</p>
          <p>Connectez-vous pour y accéder.</p>
        </mj-text>
         `,
        url,
        labelCTA: "Accéder à mon espace",
      }),
    );

  return sendEmailWithLink({
    to: { email },
    htmlContent,
    customUrl: `/candidacies/${candidacyId}/summary/`,
    subject: "Une nouvelle candidature est arrivée",
    app: "admin",
  });
};
