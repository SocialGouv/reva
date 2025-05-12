import mjml2html from "mjml";
import { isFeatureActiveForUser } from "../../../feature-flipping/feature-flipping.features";
import {
  getBackofficeUrl,
  sendEmailUsingTemplate,
  sendEmailWithLink,
  templateMail,
} from "../../../shared/email";

export const sendFeasibilityConfirmedByCandidateWithSwornAttestmentToAAP =
  async ({
    aapEmail,
    aapName,
    candidateName,
  }: {
    aapEmail: string;
    aapName: string;
    candidateName: string;
  }) => {
    const useBrevoTemplate = await isFeatureActiveForUser({
      feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_CERTIFICATEURS",
    });

    if (useBrevoTemplate) {
      return sendEmailUsingTemplate({
        to: [{ email: aapEmail }],
        templateId: 594,
        params: {
          aapName,
          candidateName,
          backofficeUrl: getBackofficeUrl({ path: "/" }),
        },
      });
    }

    const htmlContent = (url: string) =>
      mjml2html(
        templateMail({
          content: `
        <p>Bonjour ${aapName},</p>
        <p>Votre candidat ${candidateName} a validé son dossier de faisabilité. Que vous reste-t-il à faire désormais ?</p>
        <ol>
          <li>Vérifier qu’il a envoyé son attestation sur l’honneur et la relire attentivement pour vérifier qu’elle soit bien complétée et signée. S’il a besoin d’aide pour télécharger et remplir ce document, vous pouvez l’aider depuis votre espace, rubrique “Recevabilité”.</li>
          <li>Envoyer le dossier de faisabilité au certificateur pour qu’il prononce son avis de recevabilité. Cette action est réalisable depuis votre espace France VAE.</li>
          <li>Rester en contact avec le candidat s’il a des questions ou besoin de conseils.</li>
        </ol>
      `,
          labelCTA: "Accéder à mon espace",
          url,
          bottomLine: `
        <p>Nous restons disponibles si vous souhaitez plus d’informations.</p>
        <p>Cordialement,</p>
        <p>L’équipe France VAE</p>
      `,
        }),
      );

    return sendEmailWithLink({
      to: { email: aapEmail },
      htmlContent,
      subject: "Un dossier de faisabilité a été validé par un candidat",
      app: "admin",
    });
  };
