import mjml2html from "mjml";
import { sendEmailWithLink, templateMail } from "../../../shared/email";

export const sendDFFNotificationToCandidateEmail = ({
  email,
}: {
  email: string;
}) => {
  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        content: `
        <p>Bonjour,</p>
        <p>Votre accompagnateur a terminé de remplir votre dossier de faisabilité. Connectez-vous à votre espace, prenez le temps de le lire avec soin, relevez les éventuels oublis ou modifications à faire, et envoyez-lui une déclaration sur l’honneur pour valider votre dossier.</p>
        <p>Pour vous aider, vous trouverez un modèle d’attestation sur l’honneur à remplir dans le résumé de votre candidature.</p>
        <p>1. Téléchargez le document ;</p>
        <p>2. Remplissez-le avec les informations appropriées ;</p>
        <p>3. Signez-le puis transmettez-le directement depuis votre espace candidat.</p>
        <p>Vous pouvez retrouver votre dossier de faisabilité ainsi que le modèle de l’attestation sur l’honneur dans votre espace France VAE, dans la rubrique “Dossier de faisabilité” :</p>
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
};
