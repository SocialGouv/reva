import mjml2html from "mjml";
import {
  sendEmailUsingTemplate,
  sendGenericEmail,
  templateMail,
} from "../../../shared/email";
import { isFeatureActiveForUser } from "../../../feature-flipping/feature-flipping.features";

export const sendCandidacyContestationCaduciteInvalidatedEmailToAap = async ({
  candidateFullName,
  aapLabel,
  aapEmail,
}: {
  candidateFullName: string;
  aapLabel: string;
  aapEmail: string;
}) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_ORGANISM_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email: aapEmail },
      templateId: 556,
      params: {
        aapLabel,
        candidateFullName,
      },
    });
  }

  const htmlContent = mjml2html(
    templateMail({
      content: `
      <p>Bonjour ${aapLabel},</p>
      <p>Après étude de la contestation, le certificateur est revenu sur la décision initiale : la recevabilité de ${candidateFullName} est à nouveau valable et son parcours VAE peut continuer !</p>
      <p>Prochaine étape ? L'accompagner sur la rédaction de son dossier de validation et avancer, ensemble, vers le jury.</p>
      <p>N'hésitez pas à contacter votre candidat dès aujourd'hui pour travailler sur ces points.</p>
      <p>Si vous avez des questions, contactez-nous à l'adresse support@vae.gouv.fr.</p>
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
      "La contestation de recevabilité a été acceptée par le certificateur",
  });
};
