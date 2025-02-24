import mjml2html from "mjml";
import {
  sendEmailUsingTemplate,
  sendGenericEmail,
  templateMail,
} from "../../../shared/email";
import { isFeatureActiveForUser } from "../../../feature-flipping/feature-flipping.features";

export const sendCandidacyContestationCaduciteConfirmedEmailToCandidate =
  async ({
    candidateFullName,
    candidateEmail,
  }: {
    candidateFullName: string;
    candidateEmail: string;
  }) => {
    const useBrevoTemplate = await isFeatureActiveForUser({
      feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_CANDIDATE_EMAILS",
    });

    if (useBrevoTemplate) {
      return sendEmailUsingTemplate({
        to: { email: candidateEmail },
        templateId: 510,
        params: {
          candidateFullName,
        },
      });
    } else {
      const htmlContent = mjml2html(
        templateMail({
          content: `
      <p>Bonjour ${candidateFullName},</p>
      <p>Le certificateur a étudié votre contestation et les éléments fournis ne permettent pas de revenir sur la décision initiale. Votre recevabilité n'est plus valable et votre parcours VAE s'arrête ici.</p>
      <p>Si vous avez des questions, vous pouvez directement vous adresser à votre certificateur.</p>
      <p>Cordialement,</p>
      <p>L'équipe France VAE</p>
      <br/>
      <p><em>Procédure d'actualisation conforme aux dispositions de <a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000048699561">l'article R. 6412-4 du Code du travail</a> modifié par <a href="https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000048679311">l'article 2 du décret n° 2023-1275 du 27 décembre 2023 relatif à la validation des acquis de l'expérience</a></em></p>
      `,
        }),
      );

      return sendGenericEmail({
        to: { email: candidateEmail },
        htmlContent: htmlContent.html,
        subject: "Votre contestation a été refusée par le certificateur",
      });
    }
  };
