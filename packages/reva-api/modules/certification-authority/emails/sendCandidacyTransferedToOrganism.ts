import mjml2html from "mjml";

import {
  getBackofficeUrl,
  sendEmailUsingTemplate,
  sendEmailWithLink,
  templateMail,
} from "../../shared/email";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendCandidacyTransferedToOrganismEmail = async ({
  email,
  organismName,
  candidateName,
  certificationAuthorityName,
}: {
  email: string;
  organismName: string;
  candidateName: string;
  certificationAuthorityName: string;
}) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_ORGANISM_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 540,
      params: {
        backofficeUrl: getBackofficeUrl({ path: "/" }),
        organismName,
        candidateName,
        certificationAuthorityName,
      },
    });
  } else {
    const htmlContent = (url: string) =>
      mjml2html(
        templateMail({
          content: `
          <p>Bonjour ${organismName},</p>
          <p>Nous vous informons que la certification visée par le candidat ${candidateName} sera désormais traitée par ${certificationAuthorityName}.</p>
          <p>Vous trouverez les informations liées à ce nouvel interlocuteur dans votre espace.</p>
         `,
          url,
          labelCTA: "Accéder à mon espace",
          bottomLine: `
        <p>Nous restons disponibles si vous avez des questions sur ce transfert.</p>
        <p>Cordialement,</p>
        <p>L'équipe France VAE</p>
        `,
        }),
      );

    return sendEmailWithLink({
      to: { email },
      htmlContent,
      subject: "Votre candidat a un nouveau certificateur",
      app: "admin",
    });
  }
};
