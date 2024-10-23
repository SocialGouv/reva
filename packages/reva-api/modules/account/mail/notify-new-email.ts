import mjml2html from "mjml";

import { sendGenericEmail } from "../../shared/email";
import { template } from "./template";

export const notifyNewEmailAddress = async ({ email }: { email: string }) => {
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
