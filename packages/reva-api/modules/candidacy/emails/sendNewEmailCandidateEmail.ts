import mjml2html from "mjml";

import { sendGenericEmail, templateMail } from "../../shared/email";

export const sendNewEmailCandidateEmail = ({ email }: { email: string }) => {
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
};
