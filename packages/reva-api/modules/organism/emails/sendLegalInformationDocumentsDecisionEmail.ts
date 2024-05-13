import mjml2html from "mjml";

import { sendEmailWithLink, sendGenericEmail, templateMail } from "../../shared/email";
import { logger } from "../../shared/logger";

// const baseUrl = process.env.APP_BASE_URL || "https://vae.gouv.fr";

export const sendLegalInformationDocumentsApprovalEmail = async ({
  email,
  managerName,
}: {
  email: string;
  managerName: string;
}) => {
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
  return sendEmailWithLink({
    app: "admin",
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
          <p>Besoin d’aide ? Vous pouvez nous contacter à l’adresse support@vae.gouv.fr.</p>

          <p>Cordialement,</p>
          
          <p>L’équipe France VAE</p>
        `,
        labelCTA: "Accéder à mon compte",
        url,
        }),
      );
      if (htmlContent.errors.length > 0) {
        const errorMessage = htmlContent.errors
          .map((e) => e.formattedMessage)
          .join("\n");
        logger.error(errorMessage);
        throw new Error(errorMessage);
      }
      return htmlContent
    },
    subject: "Une action est attendue de votre part dans votre espace",
  });
};