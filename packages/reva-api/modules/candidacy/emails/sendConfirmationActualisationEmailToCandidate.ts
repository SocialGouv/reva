import mjml2html from "mjml";
import { sendGenericEmail, templateMail } from "../../shared/email";

export const sendConfirmationActualisationEmailToCandidate = async ({
  candidateEmail,
  candidateFullName,
}: {
  candidateEmail: string;
  candidateFullName: string;
}) => {
  const htmlContent = mjml2html(
    templateMail({
      content: `
      <p>Bonjour ${candidateFullName},</p>
      <p>Nous vous confirmons que votre actualisation a bien été enregistrée !</p>
      <p>Prochaine étape ? Travailler sur votre dossier de validation afin de prouver au jury que vous avez l'expérience et les connaissances nécessaires pour obtenir votre diplôme !</p>
      <p>Si vous avez des questions ou si vous rencontrez des difficultés, vous pouvez consulter notre <a href="https://scribehow.com/shared/Parcours_candidat__vp9k4YzATvmheao9kAoKjw">tutoriel candidat</a> ou nous contacter à l'adresse support@vae.gouv.fr.</p>
      <p>À très vite !</p>
      <p>L'équipe France VAE</p>
      <br/>
      <p><em>Procédure d'actualisation conforme aux dispositions de <a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000048699561">l'article R. 6412-4 du Code du travail</a> modifié par <a href="https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000048679311">l'article 2 du décret n° 2023-1275 du 27 décembre 2023 relatif à la validation des acquis de l'expérience</a></em></p>
      `,
    }),
  );

  return sendGenericEmail({
    to: { email: candidateEmail },
    htmlContent: htmlContent.html,
    subject: "Actualisation confirmée !",
  });
};
