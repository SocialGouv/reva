import mjml2html from "mjml";

import {
  sendEmailUsingTemplate,
  sendGenericEmail,
  templateMail,
} from "../../shared/email";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendNewEmailCandidateEmail = async ({
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
      templateId: 499,
    });
  } else {
    const htmlContent = mjml2html(
      templateMail({
        content: `
      <p>Bonjour,</p>
      <p>Vous avez demandé à changer votre e-mail sur France VAE, sachez que la modification a été effectuée.</p>
      <p>Cet e-mail sera désormais votre nouvel identifiant, il vous sera utile pour vous connecter à France VAE. Il servira également pour tous vos échanges concernant votre parcours VAE.</p>
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
