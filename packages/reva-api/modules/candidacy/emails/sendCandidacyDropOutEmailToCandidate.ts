import mjml2html from "mjml";

import { sendEmailWithLink, templateMail } from "../../shared/email";
import { generateJwt } from "../../candidate/auth.helper";

export const sendCandidacyDropOutEmailToCandidate = async (email: string) => {
  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        content: `<p>Nous vous informons que dans le cadre de votre parcours VAE, votre conseiller a placé votre candidature en abandon.</p>
        <p>Vous avez la possibilité de confirmer cette décision ou de la contester afin de poursuivre votre parcours. 
        Sans action de votre part dans un délai de 6 mois, votre parcours sera automatiquement abandonné.</p>
        `,
        labelCTA: "Accéder à mon espace",
        url,
        bottomLine: `<p>L’équipe France VAE.</p>`,
      }),
    );

  const token = generateJwt({ email, action: "login" }, 1 * 60 * 60 * 24 * 4);

  return sendEmailWithLink({
    to: { email },
    token,
    action: "login",
    htmlContent,
    subject: "Votre accompagnateur a déclaré votre abandon de candidature",
    app: "candidate",
  });
};
