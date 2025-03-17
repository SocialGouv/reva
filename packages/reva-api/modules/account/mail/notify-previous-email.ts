import mjml2html from "mjml";

import { sendEmailUsingTemplate, sendGenericEmail } from "../../shared/email";
import { template } from "./template";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const notifyPreviousEmailAddress = async ({
  email,
  newEmail,
}: {
  email: string;
  newEmail: string;
}) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_ORGANISM_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 559,
      params: { newEmail },
    });
  }

  const htmlContent = mjml2html(
    template({
      message: `Bonjour,
          <p>Vous avez demandé à changer votre e-mail sur France VAE, sachez que la modification a été effectuée.</p>
        <p>Si vous n'êtes pas à l'origine de cette demande, contactez immédiatement le support par email à <a href="mailto:support@vae.gouv.fr">support@vae.gouv.fr</a>.</p>
        <p>L’équipe France VAE</p>
      `,
    }),
  );

  return sendGenericEmail({
    to: { email },
    htmlContent: htmlContent.html,
    subject: "Votre e-mail sur France VAE a été changé",
  });
};
