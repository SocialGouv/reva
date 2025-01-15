import mjml2html from "mjml";

import { sendGenericEmail, templateMail } from "../../shared/email";

export const sendCandidacyIsCaduqueEmailToAap = async ({
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
      <p>Vous accompagnez actuellement ${candidateFullName}. Malheureusement, ce dernier ne s'est pas actualisé et sa recevabilité est désormais caduque.</p>
      <p>S'il souhaite continuer son parcours, il pourra contester cette décision auprès du certificateur.</p>
      <p>Sinon, son parcours VAE s'arrêtera ici.</p>
      <p>Vous pouvez le contacter pour discuter avec lui de cette situation et le guider, si nécessaire.</p>
      <p>Pour toute question, contactez-nous à l'adresse support@vae.gouv.fr.</p>
      <p>Cordialement,</p>
      <p>L'équipe France VAE</p>
      `,
    }),
  );

  return sendGenericEmail({
    to: { email: aapEmail },
    htmlContent: htmlContent.html,
    subject: "La recevabilité de votre candidat n'est plus valable",
  });
};
