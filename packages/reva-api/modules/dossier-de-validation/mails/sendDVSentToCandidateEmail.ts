import mjml2html from "mjml";
import { sendGenericEmail, templateMail } from "../../shared/email";

export const sendDVSentToCandidateEmail = ({ email }: { email: string }) => {
  const htmlContent = mjml2html(
    templateMail({
      content: `
          Nous vous informons que votre architecte accompagnateur de parcours a transmis votre dossier de validation  au certificateur.
          <br />
          <br />
          Votre dossier va être consulté par des membres d’un jury VAE et vous recevrez une convocation vous informant d’une date de passage devant ce jury dans les 3 mois à compter de ce jour.
        `,
      bottomLine: "L'équipe France VAE",
    }),
  ).html;

  return sendGenericEmail({
    to: { email },
    htmlContent,
    subject: "Votre dossier de validation a été transmis",
  });
};
