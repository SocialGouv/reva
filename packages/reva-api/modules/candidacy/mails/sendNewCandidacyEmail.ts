import mjml2html from "mjml";
import { sendEmailWithLink, templateMail } from "../../shared/email";

export const sendNewCandidacyEmail = ({ email }: { email: string }) => {
  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        headlineDsfr: `<div>Une nouvelle candidature est arrivée</div>`,
        content: `
        <mj-text font-size="16px" font-family="helvetica">
          <p>Bonjour,</p>
          <p>Une nouvelle candidature VAE est disponible dans votre espace de travail.</p>
          <p>Connectez-vous pour y accéder.</p>
        </mj-text>
         `,
        url,
        labelCTA: "Accéder à mon espace",
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
