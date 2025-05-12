import mjml2html from "mjml";
import { isFeatureActiveForUser } from "../../../feature-flipping/feature-flipping.features";
import {
  getBackofficeUrl,
  sendEmailUsingTemplate,
  sendEmailWithLink,
  templateMail,
} from "../../../shared/email";

export const sendFeasibilityConfirmedByCandidateWithoutSwornAttestmentToAAP =
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
      feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_ORGANISM_EMAILS",
    });

    if (useBrevoTemplate) {
      return sendEmailUsingTemplate({
        to: [{ email: aapEmail }],
        templateId: 589,
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
        <p>Votre candidat ${candidateName} a validé son dossier de faisabilité mais n’a pas transmis son attestation sur l’honneur. Vous pouvez l’aider à télécharger et remplir ce document depuis votre espace, rubrique “Recevabilité”. Un modèle d’attestation sur l’honneur vous y attend !</p>
        <p>Remplissez-le avec ou pour le candidat, faites-lui signer le document et transmettez-le directement depuis la page “Attestation sur l’honneur”.</p>
        <p>Ce document est nécessaire pour considérer le dossier de faisabilité comme validé par le candidat et passer aux prochaines étapes.</p>
      `,
          labelCTA: "Accéder à mon espace",
          url,
          bottomLine: `
        <p>Nous restons disponibles si vous avez des questions ou besoin d’informations complémentaires.</p>
        <p>Cordialement,</p>
        <p>L’équipe France VAE</p>
      `,
        }),
      );

    return sendEmailWithLink({
      to: { email: aapEmail },
      htmlContent,
      subject:
        "Avez-vous pensé à ajouter l’attestation sur l’honneur du candidat ?",
      app: "admin",
    });
  };
