import mjml2html from "mjml";

import {
  sendEmailUsingTemplate,
  sendGenericEmail,
  templateMail,
} from "../../shared/email";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendAutoCandidacyDropOutConfirmationEmailToCandidate = async ({
  candidateEmail,
  candidateFullName,
}: {
  candidateEmail: string;
  candidateFullName: string;
}) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_CANDIDATE_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email: candidateEmail },
      templateId: 520,
      params: {
        candidateFullName,
      },
    });
  } else {
    const htmlContent = mjml2html(
      templateMail({
        content: `
      <div>Bonjour ${candidateFullName},</div>
      <p>Votre AAP a déclaré votre abandon il y a 6 mois. Parce que vous n’avez pas contesté cette décision, l'abandon est confirmé automatiquement 
      et votre parcours VAE s’arrête ici.</p>
      <p>Si vous souhaitez en savoir plus, contactez votre accompagnateur ou le support France VAE à support@vae.gouv.fr.</p>
      <p>Cordialement,</p>
      <p>L’équipe France VAE.</p>
        `,
      }),
    );

    return sendGenericEmail({
      to: { email: candidateEmail },
      htmlContent: htmlContent.html,
      subject: "Abandon confirmé automatiquement",
    });
  }
};
