import mjml2html from "mjml";
import { sendGenericEmail, templateMail } from "../../../shared/email";

export const sendDFFNotificationToCandidateEmail = ({
  email,
}: {
  email: string;
}) => {
  const htmlContent = mjml2html(
    templateMail({
      content: `
        <p>Bonjour,</p>
        <p>Votre accompagnateur a terminé de remplir votre dossier de faisabilité. Prenez le temps de le lire avec soin, relevez les éventuels oublis ou modifications à faire, et envoyez-lui une déclaration sur l’honneur pour valider votre dossier.</p>
        <p>Pour vous aider, vous trouverez un modèle d'attestation sur l'honneur à remplir dans le résumé de votre candidature.</p>
        <p>Téléchargez le document ;</p>
        <p>Remplissez-le avec les informations appropriées ;</p>
        <p>Signez-le puis transmettez-le directement depuis votre résumé de candidature.</p>
        <p>Si vous rencontrez des difficultés, contactez directement votre accompagnateur. Il saura vous guider !</p>
        <p>Cordialement</p>
        <p>L'équipe France VAE</p>
        `,
    }),
  ).html;

  return sendGenericEmail({
    to: { email },
    htmlContent,
    subject: "Votre dossier de faisabilité est prêt, validez-le !",
  });
};
