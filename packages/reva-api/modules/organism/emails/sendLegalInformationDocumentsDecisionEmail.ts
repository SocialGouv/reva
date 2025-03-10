import mjml2html from "mjml";

import {
  getBackofficeUrl,
  sendEmailUsingTemplate,
  sendEmailWithLink,
  sendGenericEmail,
  templateMail,
} from "../../shared/email";
import { logger } from "../../shared/logger";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendLegalInformationDocumentsApprovalEmail = async ({
  email,
  managerName,
}: {
  email: string;
  managerName: string;
}) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_ORGANISM_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 531,
      params: {
        managerName,
      },
    });
  } else {
    const htmlContent = mjml2html(
      templateMail({
        content: `
      <p>Bonjour ${managerName},</p>
      <p>Nous vous informons que vos pièces justificatives ont été validées. Votre compte est désormais à jour.</p>
      <p>Besoin d’aide ? Vous pouvez nous contacter à l’adresse support@vae.gouv.fr.</p>

      <p>Cordialement,</p>
      
      <p>L’équipe France VAE</p>
    `,
      }),
    );

    if (htmlContent.errors.length > 0) {
      const errorMessage = htmlContent.errors
        .map((e) => e.formattedMessage)
        .join("\n");
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return sendGenericEmail({
      to: { email },
      htmlContent: htmlContent.html,
      subject: "Vos pièces justificatives sont validées",
    });
  }
};

export const sendLegalInformationDocumentsUpdateNeededEmail = async ({
  email,
  managerName,
  aapComment,
}: {
  email: string;
  managerName: string;
  aapComment: string;
}) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_ORGANISM_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 532,
      params: {
        managerName,
        aapComment,
        backofficeUrl: getBackofficeUrl({ path: "/" }),
      },
    });
  } else {
    return sendEmailWithLink({
      app: "admin",
      action: "agencies-settings-v3",
      to: { email },
      htmlContent: (url: string) => {
        const htmlContent = mjml2html(
          templateMail({
            content: `
          <p>Bonjour ${managerName},</p>
          <p>Nous vous remercions pour l’envoi de vos documents. </p>
          <p>Après examen de l’administrateur VAE, votre compte ne peut être vérifié pour les raisons suivantes : </p>
          <p style="border-left: 3px solid #ccc; padding-left: 15px;">${aapComment}</p>
          <p>Rendez-vous dans votre espace professionnel afin de renvoyer vos documents : </p>
        `,
            labelCTA: "Accéder à mon compte",
            url,
            bottomLine: `
          <p>Besoin d’aide ? Vous pouvez nous contacter à l’adresse support@vae.gouv.fr.</p>

          <p>Cordialement,</p>
          
          <p>L’équipe France VAE</p>`,
          }),
        );
        if (htmlContent.errors.length > 0) {
          const errorMessage = htmlContent.errors
            .map((e) => e.formattedMessage)
            .join("\n");
          logger.error(errorMessage);
          throw new Error(errorMessage);
        }
        return htmlContent;
      },
      subject: "Une action est attendue de votre part dans votre espace",
    });
  }
};
