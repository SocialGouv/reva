import mjml2html from "mjml";

import {
  sendEmailUsingTemplate,
  sendEmailWithLink,
  templateMail,
} from "../../shared/email";
import { generateJwt } from "../auth.helper";
import { getCandidateLoginUrl } from "../features/getCandidateLoginUrl";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendLoginEmail = async (email: string) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 493,
      params: {
        candidateLoginUrl: getCandidateLoginUrl({
          candidateEmail: email,
        }),
      },
    });
  } else {
    const token = generateJwt({ email, action: "login" }, 4 * 60 * 60);

    const htmlContent = (url: string) =>
      mjml2html(
        templateMail({
          content:
            "Bonjour, vous avez demandé à accéder à votre compte France VAE, retrouvez votre dossier dès maintenant en cliquant sur le bouton ci-dessous.",
          labelCTA: "Reprendre mon parcours",
          url,
          bottomLine:
            "Si vous n'êtes pas à l'origine de cette demande, merci de ne pas tenir compte de cet e-mail.<br /><br />Ce lien est valide 4 heures et ne peut être utilisé qu’une fois.<br /><br />L’équipe France VAE",
          disableThanks: true,
        }),
      );

    return sendEmailWithLink({
      to: { email },
      token,
      action: "login",
      htmlContent,
      subject: "Accédez à votre compte France VAE",
      app: "candidate",
    });
  }
};
