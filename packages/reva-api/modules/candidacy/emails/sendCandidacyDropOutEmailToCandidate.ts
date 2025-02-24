import mjml2html from "mjml";

import {
  sendEmailUsingTemplate,
  sendEmailWithLink,
  templateMail,
} from "../../shared/email";
import { generateJwt } from "../../candidate/auth.helper";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";
import { getCandidateLoginUrl } from "../../candidate/utils/candidate.url.helpers";

export const sendCandidacyDropOutEmailToCandidate = async (email: string) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_CANDIDATE_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 491,
      params: {
        candidateLoginUrl: getCandidateLoginUrl({ candidateEmail: email }),
      },
    });
  } else {
    const token = generateJwt({ email, action: "login" }, 1 * 60 * 60 * 24 * 4);

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
    return sendEmailWithLink({
      to: { email },
      token,
      action: "login",
      htmlContent,
      subject: "Votre accompagnateur a déclaré votre abandon de candidature",
      app: "candidate",
    });
  }
};
