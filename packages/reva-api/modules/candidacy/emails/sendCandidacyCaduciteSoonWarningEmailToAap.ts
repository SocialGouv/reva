import mjml2html from "mjml";

import {
  sendEmailUsingTemplate,
  sendGenericEmail,
  templateMail,
} from "../../shared/email";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendCandidacyCaduciteSoonWarningEmailToAap = async ({
  aapEmail,
  aapLabel,
  candidateFullName,
}: {
  aapEmail: string;
  aapLabel: string;
  candidateFullName: string;
}) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_ORGANISM_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email: aapEmail },
      templateId: 546,
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
      <p>Vous accompagnez actuellement ${candidateFullName}. Il est demandé aux candidats de s'actualiser depuis leur espace tous les 6 mois.</p>
      <p>Pour information, sans actualisation de sa part d'ici 2 semaines, sa recevabilité deviendra caduque et son parcours VAE s'arrêtera.</p>
      <p>N'hésitez pas à lui rappeler de s'actualiser !</p>
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
    subject: "L'un de vos candidats doit s'actualiser",
  });
};
