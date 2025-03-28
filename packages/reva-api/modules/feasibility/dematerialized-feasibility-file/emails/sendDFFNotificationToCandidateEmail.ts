import mjml2html from "mjml";
import {
  sendEmailUsingTemplate,
  sendEmailWithLink,
  templateMail,
} from "../../../shared/email";
import { getCandidateAppUrl } from "../../../candidate/utils/candidate.url.helpers";
import { isFeatureActiveForUser } from "../../../feature-flipping/feature-flipping.features";

export const sendDFFNotificationToCandidateEmail = async ({
  email,
}: {
  email: string;
}) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_CANDIDATE_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 521,
      params: {
        candidateAppUrl: getCandidateAppUrl(),
      },
    });
  } else {
    const htmlContent = (url: string) =>
      mjml2html(
        templateMail({
          content: `
        <p>Bonjour,</p>
        <p>Votre accompagnateur a terminé de remplir votre dossier de faisabilité.</p>
        <p>Connectez-vous à votre espace, prenez le temps de le lire avec soin, transmettez-lui les éventuels oublis ou modifications à faire, et, lorsque tout est bon pour vous, envoyez-lui une attestation sur l’honneur pour valider votre dossier !</p>
        <p>Pour vous aider, vous trouverez un modèle d’attestation sur l’honneur à remplir dans le résumé de votre candidature.</p>
        <p>1. Téléchargez le document ;</p>
        <p>2. Remplissez-le avec les informations appropriées ;</p>
        <p>3. Signez-le puis transmettez-le directement depuis votre espace candidat.</p>
        <p>Vous pouvez retrouver votre dossier de faisabilité ainsi que le modèle de l’attestation sur l’honneur dans votre espace France VAE, dans la rubrique “Recevabilité” :</p>
        `,
          labelCTA: "Se connecter",
          url,
          bottomLine: `
        <p>Si vous rencontrez des difficultés, contactez directement votre accompagnateur. Il saura vous guider !</p>
        <p>Cordialement</p>
        <p>L'équipe France VAE</p>
      `,
        }),
      );

    return sendEmailWithLink({
      to: { email },
      htmlContent,
      subject: "Votre dossier de faisabilité est prêt, validez-le !",
      app: "candidate",
    });
  }
};
