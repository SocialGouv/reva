import mjml2html from "mjml";

import { sendEmailWithLink, templateMail } from "../../shared/email";

export const sendJuryScheduledReminderCandidateEmail = async ({
  email,
}: {
  email: string;
}) => {
  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        content: `
      <p>Bonjour,</p>
      <p>Un moment important de votre parcours arrive bientôt :</p>
      <p>votre passage devant le jury VAE ! </p>
      <p>Vous trouverez toutes les informations relatives à celui-ci dans votre espace personnel et sur votre convocation officielle:</p>
    `,
        url,
        labelCTA: "Accéder à mon espace personnel",
        bottomLine: `
        <p>Bonne préparation et n'oubliez pas de croire en vous.</p>
        <p>Nous restons à votre disposition pour toute question.</p>
        <p>Cordialement,</p>
        <p>L'équipe France VAE</p>
        `,
      }),
    );

  return sendEmailWithLink({
    to: { email },
    htmlContent,
    subject: "N'oubliez pas votre passage en jury VAE",
    app: "app",
  });
};
