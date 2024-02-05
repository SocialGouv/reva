import mjml2html from "mjml";
import { sendEmailWithLink, templateMail } from "../../shared/email";

export const sendNewDVToCertificationAuthoritiesEmail = ({
  emails,
  dvId,
}: {
  emails: string[];
  dvId: string;
}) => {
  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        content: `
          Bonjour,
          <br />
          <br />
          Un nouveau dossier de validation vous a été transmis.  Vous pouvez y accéder dès maintenant en cliquant sur le bouton ci-dessous.
        `,
        labelCTA: "Accéder au dossier",
        url,
        bottomLine: "L'équipe France VAE",
      }),
    );

  return sendEmailWithLink({
    to: emails.map((email) => ({ email })),
    app: "admin2",
    htmlContent,
    customUrl: `/dossier-de-validation/${dvId}`,
    subject: "Un nouveau dossier de validation est en attente",
  });
};
