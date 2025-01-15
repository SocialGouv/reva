import mjml2html from "mjml";

import { sendGenericEmail, templateMail } from "../../shared/email";

export const sendCandidacyCaduciteSoonWarningEmailToAap = async ({
  aapEmail,
  aapLabel,
  candidateFullName,
}: {
  aapEmail: string;
  aapLabel: string;
  candidateFullName: string;
}) => {
  const htmlContent = mjml2html(
    templateMail({
      content: `
      <p>Bonjour ${aapLabel},</p>
      <p>Vous accompagnez actuellement ${candidateFullName}. Il est demandé aux candidats de s'actualiser depuis leur espace tous les 6 mois.</p>
      <p>Pour information, sans actualisation de sa part d'ici 2 semaines, sa recevabilité deviendra caduque et son parcours VAE s'arrêtera.</p>
      <p>N'hésitez pas à lui rappeler de s'actualiser !</p>
      <p>Pour toute question, contactez-nous à l'adresse support@vae.gouv.fr.</p>
      <p>Cordialement,</p>
      <p>L'équipe France VAE</p>
      `,
    }),
  );

  return sendGenericEmail({
    to: { email: aapEmail },
    htmlContent: htmlContent.html,
    subject: "L'un de vos candidats doit s'actualiser",
  });
};
