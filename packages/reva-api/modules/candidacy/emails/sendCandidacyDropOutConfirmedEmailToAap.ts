import mjml2html from "mjml";

import {
  sendEmailUsingTemplate,
  sendGenericEmail,
  templateMail,
} from "../../shared/email";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendCandidacyDropOutConfirmedEmailToAap = async ({
  aapEmail,
  aapLabel,
  candidateFullName,
}: {
  aapEmail: string;
  aapLabel: string;
  candidateFullName: string;
}) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_ORGANISM_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email: aapEmail },
      templateId: 550,
      params: {
        aapLabel,
        candidateFullName,
      },
    });
  }

  const htmlContent = mjml2html(
    templateMail({
      content: `
      <div>Bonjour ${aapLabel},</div>
      <p>Vous avez mis en abandon la candidature de ${candidateFullName}. Ce dernier a accepté votre décision et son parcours VAE s’arrête ici. </p>
      <p>Besoin de précisions ou d’informations ? Contactez-nous à l’adresse <a href="mailto:support@vae.gouv.fr">support@vae.gouv.fr</a>.</p>
      <p>Cordialement,</p>
      <p>L’équipe France VAE.</p>
        `,
    }),
  );

  return sendGenericEmail({
    to: { email: aapEmail },
    htmlContent: htmlContent.html,
    subject: "Confirmation d'abandon de votre candidat",
  });
};
