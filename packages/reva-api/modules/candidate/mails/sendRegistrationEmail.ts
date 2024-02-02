import mjml2html from "mjml";
import {
  sendEmailWithLinkPurifyJS,
  templateEmailPurifyJS,
} from "../../shared/email";

export const sendRegistrationEmail = async (email: string, token: string) => {
  const htmlContent = (url: string) =>
    mjml2html(
      templateEmailPurifyJS({
        headline:
          "<strong>Commencez</strong> dès maintenant votre parcours France VAE en cliquant sur le bouton ci-dessous.",
        labelCTA: "Démarrer mon parcours",
        url,
      }),
    );

  return sendEmailWithLinkPurifyJS({
    email,
    token,
    action: "registration",
    htmlContent,
  });
};
