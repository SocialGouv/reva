import mjml2html from "mjml";

import {
  sendEmailUsingTemplate,
  sendEmailWithLink,
  templateMail,
} from "../../../shared/email";
import { isFeatureActiveForUser } from "../../../feature-flipping/feature-flipping.features";
import { getCandidateLoginUrl } from "../../../candidate/utils/candidate.url.helpers";

export const sendTrainingEmail = async (email: string, token: string) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_CANDIDATE_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 495,
      params: {
        candidateLoginUrl: getCandidateLoginUrl({ candidateEmail: email }),
      },
    });
  } else {
    const htmlContent = (url: string) =>
      mjml2html(
        templateMail({
          content: `
          Bonjour,
          <br />
          <br />
          Vous avez entrepris une démarche de VAE et, après avoir échangé avec votre accompagnateur, le parcours le plus adapté à vos besoins a été défini !
          <br />
          <br />
          Nous avons le plaisir de vous informer qu’il est maintenant prêt.
          <br />
          <br />
          Nous vous invitons à le valider rapidement en cliquant sur le bouton ci-dessous. Ce lien sera actif pendant 4 jours.
        `,
          labelCTA: "Accéder à mon parcours pédagogique",
          url,
          bottomLine: `
          Une fois validé, votre accompagnateur pourra transmettre votre dossier au certificateur afin d’étudier votre recevabilité. 
          <br />
          <br />
          Pour vous accompagner dans cette étape, nous avons mis à votre disposition <a href="https://scribehow.com/shared/Validation_du_parcours_candidat__QHFNcjJ4T56E3cSYEphpYQ">un guide en ligne</a>.
          <br />
          <br />
          N’hésitez pas à nous contacter si vous avez la moindre question.
          <br />
          <br />
          Bien à vous,
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
      subject: "Vous devez valider votre parcours pédagogique",
      app: "candidate",
    });
  }
};
