import mjml2html from "mjml";

import {
  sendEmailUsingTemplate,
  sendGenericEmail,
  templateMail,
} from "../../shared/email";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendPreviousEmailCandidateEmail = async ({
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
      templateId: 498,
    });
  } else {
    const htmlContent = mjml2html(
      templateMail({
        content: `
      <p>Bonjour,</p>
      <p>Vous avez demandé à changer votre e-mail sur France VAE, sachez que la modification a été effectuée.</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, contactez immédiatement le support par email à <a href='mailto:support@vae.gouv.fr'>support@vae.gouv.fr</a>.</p>
      <p>L'équipe France VAE</p>
        `,
      }),
    );

    return sendGenericEmail({
      to: { email },
      subject: "Votre e-mail sur France VAE a été changé",
      htmlContent: htmlContent.html,
    });
  }
};
