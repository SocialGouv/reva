import mjml2html from "mjml";

import { sendEmailWithLink, templateMail } from "../../shared/email";

export const sendLoginEmail = async (email: string, token: string) => {
  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        content:
          "Bonjour, vous avez demandé à accéder à votre compte France VAE, retrouvez votre dossier dès maintenant en cliquant sur le bouton ci-dessous.",
        labelCTA: "Reprendre mon parcours",
        url,
        bottomLine:
          "Si vous n'êtes pas à l'origine de cette demande, merci de ne pas tenir compte de cet e-mail.<br /><br />Ce lien est valide 1 heure et ne peut être utilisé qu’une fois.<br /><br />L’équipe France VAE",
        disableThanks: true,
      }),
    );

  return sendEmailWithLink({
    to: { email },
    token,
    action: "login",
    htmlContent,
    subject: "Accédez à votre compte France VAE",
    app: "app",
  });
};
