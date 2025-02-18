import mjml2html from "mjml";
import { sendEmailWithLink, templateMail } from "../../shared/email";

export const sendFeasibilityDecisionTakenToAAPEmail = async ({
  email,
  feasibilityUrl,
}: {
  email: string;
  feasibilityUrl: string;
}) => {
  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        content: `
      <p>Bonjour,</p>
      <p>Un nouvel avis de recevabilité est disponible via le lien ci-dessous.</p>
      `,
        url,
        labelCTA: "Accéder à la notification de recevabilité",
        bottomLine: `
      <p>En cas de dossier recevable, vous disposez d'un délai de deux mois pour renseigner <b>la date prévisionnelle</b> à laquelle le candidat sera potentiellement prêt pour son passage devant le jury.</p>
      <p>Cordialement,</p>
      <p>L'équipe France VAE</p>
      `,
      }),
    );

  return sendEmailWithLink({
    to: { email },
    htmlContent,
    subject: "Un nouvel avis de recevabilité est disponible",
    app: "admin",
    customUrl: feasibilityUrl,
  });
};
