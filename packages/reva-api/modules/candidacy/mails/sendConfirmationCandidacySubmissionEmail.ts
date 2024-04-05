import mjml2html from "mjml";
import { sendEmailWithLink, templateMail } from "../../shared/email";

export const sendConfirmationCandidacySubmissionEmail = async ({
  email,
  organismName,
  organismEmail,
  organismAddress,
}: {
  email: string;
  organismName: string;
  organismEmail: string;
  organismAddress: string;
}) => {
  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        headlineDsfr: `<div>Votre candidature a été transmise</div>`,
        content: `
      <p>Bonjour,</p>
      <p>Votre candidature sur le site France VAE a bien été enregistrée !</p>
      <p>Vous avez choisi :</p>
     
      <p>${organismName}, ${organismAddress}, pour vous accompagner tout au long de votre parcours.</p>
      <p>Un <b>accompagnateur de cet organisme</b> prendra contact avec vous dans les prochains jours pour vous proposer un premier entretien afin de bien comprendre votre souhait de parcours et de vous guider au mieux dans sa réalisation.</p>
      <p><b>En cas de questions ou remarques</b>, vous pouvez contacter votre accompagnateur par e-mail à l'adresse suivante : ${organismEmail}</p>
      <br/>
      <strong>Important</strong>
      <p>Conformément à la réglementation en vigueur, nous tenons à porter à votre connaissance, que :</p>
      <ul>
        <li>Aucun frais d'étape de diagnostic ou étude de faisabilité ne peut vous être facturé par l’organisme accompagnateur. Ces frais sont financés par France VAE.</li>
        <li>Aucun frais d'accompagnement ne peut vous être demandé par l’organisme accompagnateur. Ces frais sont financés par France VAE.</li>
        <li>La mobilisation de votre CPF ne peut être exigée dans le cadre de cette démarche pour vos heures d’accompagnement.</li>
        <li>Le dossier de faisabilité doit être complété par l'organisme d'accompagnement et non par vous.</li>
        <li>En cas de préconisation d'acte de formation pour sécuriser votre parcours, l'organisme accompagnateur doit vous présenter trois devis/propositions de centres de formation différents, afin que vous puissiez faire un choix éclairé.</li>
      </ul>
      <p>Si vous avez des questions ou remarques sur ces dispositions, nous vous invitons à nous le signaler à l'adresse mail suivante : support@vae.gouv.fr</p>
      <br/>
      <p>L’équipe France VAE</p>
        `,
        url,
        labelCTA: "Accéder à ma candidature",
      }),
    );

  return sendEmailWithLink({
    to: { email },
    htmlContent,
    subject: "Votre candidature a été transmise",
    action: "",
  });
};
