import mjml2html from "mjml";
import { isFeatureActiveForUser } from "../../../feature-flipping/feature-flipping.features";
import {
  getBackofficeUrl,
  sendEmailUsingTemplate,
  sendEmailWithLink,
  templateMail,
} from "../../../shared/email";

export const sendDFFNotificationToCertificationAuthorityEmail = async ({
  emails,
  candidacyId,
}: {
  emails: string[];
  candidacyId: string;
}) => {
  const feasibilityUrl = getBackofficeUrl({
    path: `/candidacies/${candidacyId}/feasibility`,
  });

  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_CERTIFICATEURS",
  });

  if (useBrevoTemplate) {
    await sendEmailUsingTemplate({
      to: emails.map((email) => ({ email })),
      templateId: 568,
      params: { feasibilityUrl },
    });
  } else {
    const htmlContent = (url: string) =>
      mjml2html(
        templateMail({
          content: `
        <p>Bonjour,</p>
        <p>Vous avez reçu un nouveau dossier de faisabilité. Merci de l'examiner et de donner votre avis sur la recevabilité du candidat.</p>
        <p>Vous trouverez le dossier ici :</p>

        `,
          url,
          bottomLine: `
        <p>Pour assurer une bonne gestion du service public, vous avez 15 jours ouvrés pour vous prononcer. Le candidat et son AAP seront ensuite informés de votre décision.</p>
        <p>Cordialement,</p>
        <p>L'équipe France VAE</p>
        `,
          labelCTA: "Accéder au dossier",
        }),
      );

    return sendEmailWithLink({
      to: emails.map((email) => ({ email })),
      htmlContent,
      subject: "Un nouveau dossier de faisabilité vous a été transmis",
      app: "admin",
      customUrl: `/candidacies/${candidacyId}/feasibility`,
    });
  }
};
