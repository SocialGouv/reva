import mjml2html from "mjml";

import { sendEmailUsingTemplate, sendGenericEmail } from "../../shared/email";
import { template } from "./template";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const notifyNewEmailAddress = async ({ email }: { email: string }) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_ORGANISM_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 560,
    });
  }

  const htmlContent = mjml2html(
    template({
      message: `Bonjour,
          <p>Vous avez demandé à changer votre e-mail sur France VAE, sachez que la modification a été effectuée.</p>
          <p>Cet e-mail est désormais votre nouvel identifiant, il vous sera utile pour vous connecter à France VAE.</p>
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
