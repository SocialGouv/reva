import mjml2html from "mjml";

import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";
import {
  sendEmailUsingTemplate,
  sendGenericEmail,
  templateMail,
} from "../../shared/email";

export const sendCandidacyTransferToPreviousCertificationAuthorityEmail =
  async ({
    email,
    previousCertificationAuthorityName,
    candidateName,
    newCertificationAuthorityName,
  }: {
    email: string;
    previousCertificationAuthorityName: string;
    candidateName: string;
    newCertificationAuthorityName: string;
  }) => {
    const useBrevoTemplate = await isFeatureActiveForUser({
      feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_CERTIFICATEURS",
    });
    if (useBrevoTemplate) {
      return sendEmailUsingTemplate({
        to: { email },
        templateId: 570,
        params: {
          previousCertificationAuthorityName,
          candidateName,
          newCertificationAuthorityName,
        },
      });
    } else {
      const htmlContent = mjml2html(
        templateMail({
          content: `
      <p>Bonjour ${previousCertificationAuthorityName}</p>
      <p>Votre demande de transfert sur la candidature de ${candidateName} a bien été prise en compte.</p>
      <p>Le dossier est désormais géré par ${newCertificationAuthorityName}.</p>
      <p>Nous restons disponibles si vous avez la moindre question.</p>
      <p>Cordialement,</p>
      <p>L'équipe France VAE</p>
        `,
        }),
      );

      return sendGenericEmail({
        to: { email },
        htmlContent: htmlContent.html,
        subject: "Le transfert de candidature a bien été effectué",
      });
    }
  };
