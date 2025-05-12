import mjml2html from "mjml";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";
import {
  sendEmailWithLink,
  templateMail,
  sendEmailUsingTemplate,
} from "../../shared/email";
import { generateJwt } from "../auth.helper";

export const sendForgotPasswordEmail = async (email: string) => {
  const token = generateJwt({ email, action: "reset-password" }, 4 * 60 * 60);
  const url = `/reset-password?resetPasswordToken=${token}`;

  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_CANDIDATE_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 666,
      params: {
        resetPasswordUrl: url,
      },
    });
  }

  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        content:
          "Bonjour, vous avez demandé la réinitialisation du mot de passe de votre compte France VAE, mettez à jour votre mot de passe dès maintenant en cliquant sur le bouton ci-dessous.",
        labelCTA: "Mettre à jour le mot de passe",
        url,
        bottomLine:
          "Si vous n'êtes pas à l'origine de cette demande, merci de ne pas tenir compte de cet e-mail.<br /><br />Ce lien est valide 4 heures et ne peut être utilisé qu’une fois.<br /><br />L’équipe France VAE",
        disableThanks: true,
      }),
    );

  return sendEmailWithLink({
    to: { email },
    token,
    customUrl: url,
    htmlContent,
    subject: "Réinitialisation du mot de passe votre compte France VAE",
    app: "candidate",
  });
};
