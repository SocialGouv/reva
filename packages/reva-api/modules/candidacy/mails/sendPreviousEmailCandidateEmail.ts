import mjml2html from "mjml";
import { sendGenericEmail, templateMail } from "../../shared/email";

export const sendPreviousEmailCandidateEmail = ({
  email,
}: {
  email: string;
}) => {
  const htmlContent = mjml2html(
    templateMail({
      content: `
      <p>Bonjour,</p>
      <p>Une demande de changement de votre email sur France VAE a été envoyée, si vous êtes à l'origine de cette demande veuillez confirmer la nouvelle adresse email en consultant l'email envoyé sur cette même nouvelle adresse</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, contactez immédiatement le support par email à <a href='mailto:support@vae.gouv.fr'>support@vae.gouv.fr</a>.</p>
      <p>L’équipe France VAE.</p>
        `,
    }),
  );

  return sendGenericEmail({
    to: { email },
    subject: "Votre e-mail sur France VAE a été changé",
    htmlContent: htmlContent.html,
  });
};
