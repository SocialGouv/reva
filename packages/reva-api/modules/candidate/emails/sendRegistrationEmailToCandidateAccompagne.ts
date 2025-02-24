import mjml2html from "mjml";

import {
  sendEmailUsingTemplate,
  sendEmailWithLink,
  templateMail,
} from "../../shared/email";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";
import { getCandidateRegistrationUrl } from "../features/getCandidateRegistrationUrl";
import { generateJwt } from "../auth.helper";
import { TypeAccompagnement } from "../candidate.types";

export const sendRegistrationEmailToCandidateAccompagne = async (args: {
  email: string;
  phone: string;
  firstname: string;
  lastname: string;
  departmentId: string;
  certificationId?: string;
  typeAccompagnement: TypeAccompagnement;
}) => {
  const { email } = args;
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_CANDIDATE_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 505,
      params: { candidateRegistrationUrl: getCandidateRegistrationUrl(args) },
    });
  } else {
    const token = generateJwt({ ...args, action: "registration" }, 3 * 60 * 60);

    const htmlContent = (url: string) =>
      mjml2html(
        templateMail({
          content: `
        <p>Bonjour,</p>
        <p>Vous venez de créer votre compte France VAE afin de commencer un parcours de <b>Validation des Acquis de l’Expérience.</b></p>
        
        <h3 style="margin-bottom:0">Le parcours VAE</h3>
        <p style="margin-top:5px">Vous allez pouvoir commencer votre parcours en cliquant sur le bouton ci-dessous. Remplissez les informations concernant vos expériences professionnelles et personnelles en lien avec le diplôme que vous visez. </p>
        `,
          labelCTA: "Je commence mon parcours",
          url,
          bottomLine: `
        <h3 style="margin-bottom:0">Et si je n’ai pas le temps de tout faire maintenant ?</h3>
        <p style="margin-top:5px">Pas de panique, rien ne vous oblige à compléter tout votre profil dès maintenant, vous avez 2 mois pour finaliser votre dossier <a href="https://vae.gouv.fr/app/login/">en vous connectant à votre espace</a>.</p>
        
        <h3 style="margin-bottom:0">Notre conseil pour commencer sereinement</h3>
        <p style="margin-top:5px">Renseignez-vous auprès de l’organisme d’accompagnement au sujet des financements possibles. C’est à votre accompagnateur d’étudier les différentes solutions existantes pour financer votre parcours VAE. Plus tôt cela est fait, plus tôt vous pourrez commencer !</p>

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
      app: "candidate",
    });
  }
};
