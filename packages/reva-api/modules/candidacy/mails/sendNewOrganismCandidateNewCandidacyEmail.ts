import mjml2html from "mjml";
import { sendEmailWithLink, templateMail } from "../../shared/email";

export const sendNewOrganismCandidateNewCandidacyEmail = async ({
  email,
}: {
  email: string;
}) => {
  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        content: `
      <p>Bonjour,</p>
      <p>Une nouvelle candidature VAE est disponible dans votre espace de travail. Connectez-vous pour y accéder.</p>
        `,
        url,
        labelCTA: "Accéder à mon espace",
        bottomLine: "L'équipe France VAE",
      }),
    );

  return sendEmailWithLink({
    to: { email },
    htmlContent,
    subject: "Une nouvelle candidature est arrivée",
    action: "",
    app: "admin",
  });
};
