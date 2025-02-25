import mjml2html from "mjml";

import {
  sendEmailUsingTemplate,
  sendGenericEmail,
  templateMail,
} from "../../shared/email";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendCandidacyDropOutConfirmedEmailToCandidate = async ({
  candidateEmail,
  candidateFullName,
}: {
  candidateEmail: string;
  candidateFullName: string;
}) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_CANDIDATE_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email: candidateEmail },
      templateId: 518,
      params: {
        candidateFullName,
      },
    });
  } else {
    const htmlContent = mjml2html(
      templateMail({
        content: `
      <div>Bonjour ${candidateFullName},</div>
      <p>Vous avez récemment accepté la décision de votre accompagnateur concernant l’abandon de votre parcours VAE. 
      Nous vous informons que ce choix a bien été enregistré et transmis à l’accompagnateur par mail.</p>
      <p>Bonne continuation !</p>
      <p>Cordialement,</p>
      <p>L’équipe France VAE.</p>
        `,
      }),
    );

    return sendGenericEmail({
      to: { email: candidateEmail },
      htmlContent: htmlContent.html,
      subject: "Confirmation de votre abandon de parcours VAE",
    });
  }
};
