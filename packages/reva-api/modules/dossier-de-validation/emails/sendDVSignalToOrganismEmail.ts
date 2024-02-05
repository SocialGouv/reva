import mjml2html from "mjml";
import { sendEmailWithLink, templateMail } from "../../shared/email";

export const sendDVSignalToOrganismEmail = ({
  email,
  candadicyId,
  decisionComment,
}: {
  email: string;
  candadicyId: string;
  decisionComment: string;
}) => {
  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        content: `
          Bonjour,
          <br />
          <br />
          Un dossier de validation a été transmis au certificateur par vos soins. Ce dernier a estimé qu'il n'était pas conforme à ses attentes et vous fait part des éléments sur lesquels il attend une action de votre part.
          <br />
          <br />
          Voici les éléments qu'il a indiqués :
          ${decisionComment}
          `,
        labelCTA: "Accéder au dossier",
        url,
        bottomLine:
          "Nous vous invitons à apporter les modifications en vue de sa mise en conformité et à le renvoyer au certificateur dans les meilleurs délais.",
      }),
    );

  return sendEmailWithLink({
    to: { email },
    app: "admin",
    htmlContent,
    customUrl: `/candidacies/${candadicyId}`,
    subject: "Un dossier de validation a été signalé",
  });
};
