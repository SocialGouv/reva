import mjml2html from "mjml";

import {
  sendEmailUsingTemplate,
  sendGenericEmail,
  templateMail,
} from "../../shared/email";
import { logger } from "../../shared/logger";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendPreviousOrganismCandidateChangeOrganismEmail = async ({
  email,
  candidateFullName,
  certificationName,
  date,
}: {
  email: string;
  candidateFullName: string;
  certificationName: string;
  date: Date | null;
}) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_ORGANISM_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 534,
      params: {
        candidateFullName,
        certificationName,
      },
    });
  }

  const htmlContent = mjml2html(
    templateMail({
      content: `<p>Bonjour,</p><p>France VAE vous informe que <strong>${candidateFullName}</strong> a choisi un autre Architecte Accompagnateur de Parcours pour l’accompagner dans son projet de <i>"${certificationName}"</i>.</p>
          <p>Ce candidat n'est désormais plus dans votre portefeuille.</p>
          ${
            date
              ? `<p>De fait, le rendez-vous planifié le <strong>${date.toLocaleDateString(
                  "fr-FR",
                )}</strong> est donc annulé. </p>`
              : ""
          }
          <p>L'équipe France VAE.</p>
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

  return sendGenericEmail({
    to: { email },
    htmlContent: htmlContent.html,
    subject: "Un de vos candidats a changé d’accompagnateur",
  });
};
