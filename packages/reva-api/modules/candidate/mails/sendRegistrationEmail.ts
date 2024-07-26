import mjml2html from "mjml";

import { sendEmailWithLink, templateMail } from "../../shared/email";

export const sendRegistrationEmail = async (email: string, token: string) => {
  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        content: `
        <p>Bonjour,</p>
        <p>Vous venez de créer votre compte France VAE afin de commencer un parcours de <b>Validation des Acquis de l’Expérience.</b></p>
        
        <h3 style="margin-bottom:0">Le parcours VAE</h3>
        <p style="margin-top:5px">Vous allez pouvoir commencer votre parcours en cliquant sur le bouton ci-dessous. Il vous sera demandé de remplir des informations concernant vos expériences professionnelles et personnelles qui vous paraissent être en relation avec le diplôme que vous visez. </p>
        `,
        labelCTA: "Je commence mon parcours",
        url,
        bottomLine: `
        <h3 style="margin-bottom:0">Et si je n’ai pas le temps de tout faire maintenant ?</h3>
        <p style="margin-top:5px">Pas de panique, rien ne vous oblige à compléter tout votre profil dès maintenant, vous pourrez toujours revenir plus tard <a href="${url}">en vous connectant à nouveau</a> pour finaliser votre dossier.</p>
        
        <h3 style="margin-bottom:0">Besoin d’aide ?</h3>
        <p style="margin-top:5px">Nos équipes ont élaboré <a href="https://scribehow.com/shared/Parcours_candidat__vp9k4YzATvmheao9kAoKjw">un guide en ligne pour vous aider dans cette démarche</a>.</p>

        <p>L’équipe France VAE</p>
        `,
      }),
    );

  return sendEmailWithLink({
    to: { email },
    subject:
      "Votre compte France VAE est créé, vous pouvez commencer votre parcours",
    token,
    action: "login",
    htmlContent,
  });
};
