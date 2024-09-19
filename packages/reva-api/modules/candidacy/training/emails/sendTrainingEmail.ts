import mjml2html from "mjml";

import { sendEmailWithLink, templateMail } from "../../../shared/email";

export const sendTrainingEmail = async (email: string, token: string) => {
  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        content: `
          Vous vous êtes engagé·e dans une démarche de VAE.
          <br />
          <br />
          Après échanges avec votre Architecte Accompagnateur de Parcours, vous avez défini le parcours le plus adapté à votre situation et à votre projet.
          <br />
          <br />
          Il est désormais prêt.
          <br />
          <br />
          Nous vous invitons à le valider au plus vite. Il vous suffit de cliquer sur le bouton ci-dessous.
          <br />
          <br />
          Ce lien est valable 4 jours. 
        `,
        labelCTA: "Accéder à mon parcours pédagogique",
        url,
        bottomLine: `
          Cela permettra à votre architecte accompagnateur de parcours de transmettre votre dossier au certificateur et de faire la demande de financement de votre projet.
          <br />
          <br />
          Nos équipes ont élaboré <a href="https://scribehow.com/shared/Parcours_candidat__vp9k4YzATvmheao9kAoKjw#6062f89d">un guide en ligne pour vous aider dans cette démarche</a>.
          <br />
          <br />
          L'équipe France VAE
        `,
        disableThanks: true,
      }),
    );

  return sendEmailWithLink({
    to: { email },
    token,
    action: "login",
    htmlContent,
    subject: "Votre parcours pédagogique est prêt pour validation",
    app: "candidate",
  });
};
