import mjml2html from "mjml";

import {
  getBackofficeUrl,
  sendEmailUsingTemplate,
  sendEmailWithLink,
  templateMail,
} from "../../shared/email";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendNewOrganismCandidateNewCandidacyEmail = async ({
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
        content: `
        <p>Bonjour,</p>
        <p>Une nouvelle candidature VAE est disponible dans votre espace de travail. Connectez-vous pour y accéder.</p>
          `,
        url,
        labelCTA: "Accéder à mon espace",
        bottomLine: "L'équipe France VAE",
      }),
    );

  return sendEmailWithLink({
    to: { email },
    htmlContent,
    subject: "Une nouvelle candidature est arrivée",
    customUrl: `/candidacies/${candidacyId}/summary/`,
    app: "admin",
  });
};
