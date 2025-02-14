import mjml2html from "mjml";

import { sendGenericEmail, templateMail } from "../../shared/email";

export const sendSubscriptionRequestCreatedEmail = async ({
  email,
}: {
  email: string;
}) => {
  const htmlContent = mjml2html(
    templateMail({
      content: `
      <p>Bonjour,</p>
      <p>Nous avons pris connaissance de votre demande de référencement comme Architecte Accompagnateur de Parcours ou AAP sur le nouveau portail de la VAE.</p>
      <p>Pour finaliser votre inscription sur la plateforme France VAE, vous devez d'abord consulter et répondre à ce questionnaire de présentation et d'explication du rôle de l'Architecte Accompagnateur de Parcours : <a href="https://tally.so/r/n0M4Ry">lien vers le questionnaire</a></p>
      <p>Vous découvrirez :</p>
      <ul>
        <li>le cadre et périmètre de la phase de déploiement</li>
        <li>les missions d'un AAP</li>
        <li>les fonctionnalités clés de votre espace professionnel sur France VAE</li>
      </ul>
      <p>Nous vous invitons à le compléter jusqu'au bout.</p>
      <p>Très belle journée à vous,</p>
      <p>Cordialement,</p>
      <p>L'équipe VAE</p>
      `,
    }),
  );

  return sendGenericEmail({
    to: { email },
    htmlContent: htmlContent.html,
    subject: "Inscription prise en compte",
  });
};
