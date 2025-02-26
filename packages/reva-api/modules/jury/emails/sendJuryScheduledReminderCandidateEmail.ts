import mjml2html from "mjml";

import {
  sendEmailUsingTemplate,
  sendEmailWithLink,
  templateMail,
} from "../../shared/email";
import { getCandidateAppUrl } from "../../candidate/utils/candidate.url.helpers";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendJuryScheduledReminderCandidateEmail = async ({
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
      templateId: 525,
      params: {
        candidateAppUrl: getCandidateAppUrl(),
      },
    });
  } else {
    const htmlContent = (url: string) =>
      mjml2html(
        templateMail({
          content: `
      <p>Bonjour,</p>
      <p>Un moment important de votre parcours arrive bientôt :</p>
      <p>votre passage devant le jury VAE ! </p>
      <p>Vous trouverez toutes les informations relatives à celui-ci dans votre espace personnel et sur votre convocation officielle:</p>
    `,
          url,
          labelCTA: "Accéder à mon espace personnel",
          bottomLine: `
        <p>Bonne préparation et n'oubliez pas de croire en vous.</p>
        <p>Nous restons à votre disposition pour toute question.</p>
        <p>Cordialement,</p>
        <p>L'équipe France VAE</p>
        `,
        }),
      );

    return sendEmailWithLink({
      to: { email },
      htmlContent,
      subject: "N'oubliez pas votre passage en jury VAE",
      app: "candidate",
    });
  }
};
