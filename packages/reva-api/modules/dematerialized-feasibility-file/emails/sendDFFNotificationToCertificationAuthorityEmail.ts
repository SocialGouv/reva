import mjml2html from "mjml";

import { sendEmailWithLink, templateMail } from "../../shared/email";

export const sendDFFNotificationToCertificationAuthorityEmail = ({
  email,
  candidacyId,
}: {
  email: string;
  candidacyId: string;
}) => {
  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        content: `
        <p>Bonjour,</p>
        <p>Vous avez reçu un nouveau dossier de faisabilité. Merci de l'examiner et de donner votre avis sur la recevabilité du candidat.</p>
        <p>Vous trouverez le dossier ici :</p>
       
        `,
        url,
        bottomLine: `
        <p>Pour assurer une bonne gestion du service public, vous avez 15 jours ouvrés pour vous prononcer. Le candidat et son AAP seront ensuite informés de votre décision.</p>
        <p>Cordialement,</p>
        <p>L'équipe France VAE</p>
        `,
        labelCTA: "Accéder au dossier",
      }),
    );

  return sendEmailWithLink({
    to: { email },
    htmlContent,
    subject: "Un nouveau dossier de faisabilité vous a été transmis",
    app: "admin2",
    customUrl: `/candidacies/${candidacyId}/feasibility`,
  });
};
