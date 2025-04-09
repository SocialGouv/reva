import mjml2html from "mjml";

import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";
import {
  getBackofficeUrl,
  sendEmailUsingTemplate,
  sendEmailWithLink,
  templateMail,
} from "../../shared/email";

export const sendNewCertificationAvailableToCertificationRegistryManagerEmail =
  async ({ email }: { email: string }) => {
    const useBrevoTemplate = await isFeatureActiveForUser({
      feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_CERTIFICATEURS",
    });
    const certificationsUrl = getBackofficeUrl({
      path: `/responsable-certifications/certifications`,
    });
    if (useBrevoTemplate) {
      return sendEmailUsingTemplate({
        to: { email },
        templateId: 573,
        params: {
          certificationsUrl,
        },
      });
    } else {
      const htmlContent = (url: string) =>
        mjml2html(
          templateMail({
            content: `
             Bonjour,
             <p>Vous avez fait la demande d’ajout d’une certification auprès de France VAE.</p>
             <p>Celle-ci est désormais disponible dans
             votre espace et attend votre validation : </p>
             `,
            labelCTA: "Voir les certifications à valider",
            url,
            bottomLine: `
            <p>Rappel : vous devez relire les éléments récupérés via France compétences et remplir les informations manquantes avant de valider la certification. </p>
            <p>Nous restons disponibles si vous avez la moindre question.</p>
            <p>L’équipe France VAE</p>
            `,
          }),
        );

      return sendEmailWithLink({
        to: { email },
        app: "admin",
        htmlContent,
        customUrl: "/responsable-certifications/certifications",
        subject:
          "Une nouvelle certification a été ajoutée et attend votre validation ",
      });
    }
  };
