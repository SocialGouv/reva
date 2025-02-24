import mjml2html from "mjml";

import {
  sendEmailUsingTemplate,
  sendGenericEmail,
  templateMail,
} from "../../shared/email";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendDVSentToCandidateEmail = async ({
  email,
}: {
  email: string;
}) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_CANDIDATE_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 512,
    });
  } else {
    const htmlContent = mjml2html(
      templateMail({
        content: `
          <p>Nous vous confirmons que votre dossier de validation a bien été déposé et qu’il sera prochainement consulté par les membres de jury.</p>
          <p>Vous recevrez une convocation environ 15 jours avant votre date de jury.</p>
          <p>Il est prévu que le jury se tienne sous 3 mois, néanmoins certains délais organisationnels peuvent prolonger ce délai.</p>
          <p>Le cas échéant, vous pouvez contacter votre accompagnateur afin qu’il fasse une relance auprès du service concerné.</p>
          `,
        bottomLine: `
          <p>Cordialement,</p>
          <p>L'équipe France VAE</p>
          `,
      }),
    ).html;

    return sendGenericEmail({
      to: { email },
      htmlContent,
      subject: "Votre dossier de validation a été transmis",
    });
  }
};
