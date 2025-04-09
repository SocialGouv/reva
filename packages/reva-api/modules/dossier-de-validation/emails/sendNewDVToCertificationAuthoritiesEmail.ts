import mjml2html from "mjml";

import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";
import {
  getBackofficeUrl,
  sendEmailUsingTemplate,
  sendEmailWithLink,
  templateMail,
} from "../../shared/email";

export const sendNewDVToCertificationAuthoritiesEmail = async ({
  emails,
  candidacyId,
}: {
  emails: string[];
  candidacyId: string;
}) => {
  const dossierDeValidationUrl = getBackofficeUrl({
    path: `/candidacies/${candidacyId}/dossier-de-validation`,
  });

  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_CERTIFICATEURS",
  });
  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: emails.map((email) => ({ email })),
      templateId: 569,
      params: { dossierDeValidationUrl },
    });
  } else {
    const htmlContent = (url: string) =>
      mjml2html(
        templateMail({
          content: `
          Bonjour,
          <br />
          <br />
          Un nouveau dossier de validation vous a été transmis.  Vous pouvez y accéder dès maintenant en cliquant sur le bouton ci-dessous.
        `,
          labelCTA: "Accéder au dossier",
          url,
          bottomLine: "L'équipe France VAE",
        }),
      );

    return sendEmailWithLink({
      to: emails.map((email) => ({ email })),
      app: "admin",
      htmlContent,
      customUrl: `/candidacies/${candidacyId}/dossier-de-validation`,
      subject: "Un nouveau dossier de validation est en attente",
    });
  }
};
