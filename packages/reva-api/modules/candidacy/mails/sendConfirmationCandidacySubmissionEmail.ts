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
        `,
        url,
        labelCTA: "Accéder à ma candidature",
      }),
    );

  return sendEmailWithLink({
    email,
    htmlContent,
    subject: "Votre candidature a été transmise",
    action: "",
  });
};
