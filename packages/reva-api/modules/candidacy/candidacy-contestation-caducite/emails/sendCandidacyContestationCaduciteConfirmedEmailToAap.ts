import mjml2html from "mjml";
import { sendGenericEmail, templateMail } from "../../../shared/email";

export const sendCandidacyContestationCaduciteConfirmedEmailToAap = async ({
  candidateFullName,
  aapLabel,
  aapEmail,
}: {
  candidateFullName: string;
  aapLabel: string;
  aapEmail: string;
}) => {
  const htmlContent = mjml2html(
    templateMail({
      content: `
      <p>Bonjour ${aapLabel},</p>
      <p>Le certificateur a étudié la contestation de ${candidateFullName} et les éléments fournis ne permettent pas de revenir sur la décision initiale. Sa recevabilité n'est plus valable et son parcours VAE s'arrête ici.</p>
      <p>Si vous avez des questions, vous pouvez directement vous adresser au certificateur.</p>
      <p>Cordialement,</p>
      <p>L'équipe France VAE</p>
      <br/>
      <p><em>Procédure d'actualisation conforme aux dispositions de <a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000048699561">l'article R. 6412-4 du Code du travail</a> modifié par <a href="https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000048679311">l'article 2 du décret n° 2023-1275 du 27 décembre 2023 relatif à la validation des acquis de l'expérience</a></em></p>
      `,
    }),
  );

  return sendGenericEmail({
    to: { email: aapEmail },
    htmlContent: htmlContent.html,
    subject:
      "La contestation sur la recevabilité a été refusée par le certificateur",
  });
};
