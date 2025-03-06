import mjml2html from "mjml";

import {
  getBackofficeUrl,
  sendEmailUsingTemplate,
  sendEmailWithLink,
  templateMail,
} from "../../shared/email";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendDVReportedToOrganismEmail = async ({
  email,
  candadicyId,
  decisionComment,
}: {
  email: string;
  candadicyId: string;
  decisionComment: string;
}) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_ORGANISM_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 537,
      params: {
        dossierValidationAapUrl: getBackofficeUrl({
          path: `/candidacies/${candadicyId}/dossier-de-validation-aap`,
        }),
        decisionComment,
      },
    });
  } else {
    const htmlContent = (url: string) =>
      mjml2html(
        templateMail({
          content: `
          Bonjour,
          <br />
          <br />
          Un dossier de validation a été transmis au certificateur par vos soins. Ce dernier a estimé qu'il n'était pas conforme à ses attentes et vous fait part des éléments sur lesquels il attend une action de votre part.
          <br />
          <br />
          Voici les éléments qu'il a indiqués :
          ${decisionComment}
          `,
          labelCTA: "Accéder au dossier",
          url,
          bottomLine:
            "Nous vous invitons à apporter les modifications en vue de sa mise en conformité et à le renvoyer au certificateur dans les meilleurs délais.",
        }),
      );

    return sendEmailWithLink({
      to: { email },
      app: "admin",
      htmlContent,
      customUrl: `/candidacies/${candadicyId}/dossier-de-validation-aap`,
      subject: "Un dossier de validation a été signalé",
    });
  }
};
