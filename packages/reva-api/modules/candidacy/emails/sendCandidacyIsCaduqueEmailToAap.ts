import mjml2html from "mjml";

import { sendGenericEmail, templateMail } from "../../shared/email";

export const sendCandidacyIsCaduqueEmailToAap = async ({
  aapEmail,
  aapLabel,
  candidateFullName,
}: {
  aapEmail: string;
  aapLabel: string;
  candidateFullName: string;
}) => {
  const htmlContent = mjml2html(
    templateMail({
      content: `
      <p>Bonjour ${aapLabel},</p>
      <p>Vous accompagnez actuellement ${candidateFullName}. Malheureusement, ce dernier ne s'est pas actualisé et sa recevabilité est désormais caduque.</p>
      <p>S'il souhaite continuer son parcours, il pourra contester cette décision auprès du certificateur.</p>
      <p>Sinon, son parcours VAE s'arrêtera ici.</p>
      <p>Vous pouvez le contacter pour discuter avec lui de cette situation et le guider, si nécessaire.</p>
      <p>Pour toute question, contactez-nous à l'adresse support@vae.gouv.fr.</p>
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
    subject: "La recevabilité de votre candidat n'est plus valable",
  });
};
