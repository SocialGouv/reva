import mjml2html from "mjml";

import {
  getBackofficeUrl,
  sendEmailUsingTemplate,
  sendEmailWithLink,
  templateMail,
} from "../../shared/email";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendDVSentByCandidateToAapEmail = async ({
  email,
  candidacyId,
  aapName,
  candidateName,
}: {
  email: string;
  candidacyId: string;
  aapName: string;
  candidateName: string;
}) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_ORGANISM_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 553,
      params: {
        backofficeUrl: getBackofficeUrl({
          path: `/candidacies/${candidacyId}/dossier-de-validation-aap`,
        }),
        aapName,
        candidateName,
      },
    });
  }

  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        content: `
          <p>Bonjour ${aapName},</p>
          <p>Votre candidat ${candidateName} a transmis son dossier de validation au certificateur. Il sera prochainement consulté par les membres de jury.</p>
          `,
        labelCTA: "Consulter le dossier de validation déposé par le candidat",
        url,
        bottomLine: `
          <p>En cas de problème, contactez rapidement le certificateur pour qu'un nouveau dossier de validation puisse être déposé.</p>
          <p>Cordialement,</p>
          <p>L'équipe France VAE</p>
          `,
      }),
    );

  return sendEmailWithLink({
    to: { email },
    app: "admin",
    htmlContent,
    customUrl: `/candidacies/${candidacyId}/dossier-de-validation-aap`,
    subject:
      "Un candidat que vous accompagnez a transmis son dossier de validation",
  });
};
