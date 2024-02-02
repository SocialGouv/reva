import mjml2html from "mjml";
import { sendEmailWithLink, templateMail } from "../../shared/email";

export const sendNewEmailCandidateEmail = ({
  email,
  token,
}: {
  email: string;
  token: string;
}) => {
  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        content: `
        <p>Bonjour,</p>
        <p>Vous avez demandé à changer votre e-mail sur France VAE. Pour valider cette demande, merci de cliquer sur le boutton ci-dessous.</p>      
        `,
        url,
        labelCTA: "Confirmer mon e-mail",
        bottomLine: `
        <p>Ce lien est valide 1 heure et ne peut être utilisé qu’une fois.</p>
        <p>Cet e-mail sera désormais votre nouvel identifiant, il vous sera utile pour vous connecter à France VAE.</p>
        <p>L’équipe France VAE.</p>`,
      }),
    );

  return sendEmailWithLink({
    email,
    subject: "Votre e-mail sur France VAE a été changé",
    htmlContent,
    token,
    action: "confirmEmail",
  });
};
