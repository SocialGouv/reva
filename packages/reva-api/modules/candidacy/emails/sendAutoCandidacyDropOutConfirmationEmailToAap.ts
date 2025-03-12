import mjml2html from "mjml";

import {
  sendEmailUsingTemplate,
  sendGenericEmail,
  templateMail,
} from "../../shared/email";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendAutoCandidacyDropOutConfirmationEmailToAap = async ({
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
      templateId: 551,
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
      <p>Vous aviez déclaré l'abandon de ${candidateFullName}. Le candidat n'a pas validé cet abandon, mais 4 mois se sont écoulés : l'abandon est donc confirmé automatiquement.</p>
      <p>Cordialement,</p>
      <p>L’équipe France VAE.</p>
        `,
    }),
  );

  return sendGenericEmail({
    to: { email: aapEmail },
    htmlContent: htmlContent.html,
    subject: "Confirmation d'abandon automatique",
  });
};
