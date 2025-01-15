import mjml2html from "mjml";

import { sendEmailWithLink, templateMail } from "../../shared/email";

export const sendCandidacyCaduciteSoonWarningEmailToCandidate = async ({
  candidateEmail,
  candidateFullName,
  dateThresholdWillBeCaduque,
}: {
  candidateEmail: string;
  candidateFullName: string;
  dateThresholdWillBeCaduque: string;
}) => {
  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        content: `
      <p>Bonjour ${candidateFullName},</p>
      <p>Afin de nous assurer que vous poursuivez toujours votre parcours VAE, nous vous invitons à vous actualiser depuis votre compte d'ici le ${dateThresholdWillBeCaduque}.</p>
      <p>Cette étape est essentielle pour conserver votre recevabilité. Si vous ne vous actualisez pas, votre recevabilité ne sera plus valable et vous ne pourrez plus continuer votre parcours.</p>
      <p>Pour information, cette actualisation sera à renouveler tous les 6 mois.</p>
      <p>Pour vous actualiser, vous pouvez cliquer ici :</p>
        `,
        url,
        labelCTA: "Actualiser mon compte",
        bottomLine: `
        <p>Si vous avez des questions ou si vous rencontrez des difficultés, vous pouvez consulter notre <a href="https://scribehow.com/shared/Parcours_candidat__vp9k4YzATvmheao9kAoKjw">tutoriel candidat</a> ou nous contacter à l'adresse support@vae.gouv.fr.</p>
        <p>À très vite !</p>
        <p>L'équipe France VAE</p>
        `,
      }),
    );

  return sendEmailWithLink({
    to: { email: candidateEmail },
    htmlContent,
    subject: "Pensez à vous actualiser pour continuer votre parcours !",
    app: "candidate",
  });
};
