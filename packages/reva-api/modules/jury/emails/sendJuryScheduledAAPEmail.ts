import mjml2html from "mjml";

import {
  getBackofficeUrl,
  sendEmailUsingTemplate,
  sendEmailWithLink,
  templateMail,
} from "../../shared/email";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendJuryScheduledAAPEmail = async ({
  candidacyId,
  email,
  candidateFullName,
}: {
  candidacyId: string;
  email: string;
  candidateFullName: string;
}) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_ORGANISM_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 541,
      params: {
        candidateFullName,
        juryUrl: getBackofficeUrl({
          path: `/candidacies/${candidacyId}/jury-aap`,
        }),
      },
    });
  }

  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        content: `
        <p>Bonjour,</p>
        <p>Nous avons le plaisir de vous informer que la convocation pour votre candidat, ${candidateFullName}, est prête et lui sera très bientôt envoyée.  Vous pourrez retrouver les informations relatives à son passage (date et heure de passage) dans votre espace. </p>
      `,
        labelCTA: "Accéder aux informations jury",
        bottomLine: `
        <p>Nous restons à votre disposition pour toute question ou besoin d'assistance supplémentaire. </p>
        <p>Cordialement,</p>
        <p>L'équipe France VAE.</p>
        `,
        url,
      }),
    );

  return sendEmailWithLink({
    to: { email },
    htmlContent,
    app: "admin",
    subject: "Convocation de passage en jury pour un de vos candidats",
    customUrl: `/candidacies/${candidacyId}/jury-aap`,
  });
};
