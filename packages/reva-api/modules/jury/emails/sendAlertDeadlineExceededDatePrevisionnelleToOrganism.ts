import mjml2html from "mjml";
import { sendEmailWithLink, templateMail } from "../../shared/email";

export const sendAlertDeadlineExceededDatePrevisionnelleToOrganism = ({
  email,
  candadicyId,
}: {
  email: string;
  candadicyId: string;
}) => {
  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        content: `
          <p>Bonjour,</p>
          <p>France VAE vous informe que vous avez dépassé le délai de renseignement de date prévisionnelle à laquelle l'un de vos candidats devait être prêt pour son passage devant le jury.</p>
          <p>Nous vous invitons à renseigner cette date pour permettre au certificateur de prévoir l'organisation et le recrutement du jury.</p>
          `,
        labelCTA: "Accéder au dossier",
        url,
        bottomLine:
          "Si votre candidat vous a informé de son choix de ne pas poursuivre son parcours, ou que vous ne parvenez pas à entrer en contact avec lui, nous vous invitons à consulter le process lié aux cas d’abandon dans le cahier des charges (avec lien)",
      }),
    );

  return sendEmailWithLink({
    to: { email },
    app: "admin",
    htmlContent,
    customUrl: `/candidacies/${candadicyId}`,
    subject:
      "Dépassement du délai de saisie de la date prévisionnelle de passage devant le jury",
  });
};
