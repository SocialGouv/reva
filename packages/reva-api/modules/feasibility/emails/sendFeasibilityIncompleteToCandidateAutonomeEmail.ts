import mjml2html from "mjml";

import {
  formatFreeText,
  sendEmailUsingTemplate,
  sendGenericEmail,
  templateMail,
} from "../../shared/email";
import { logger } from "../../shared/logger";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendFeasibilityIncompleteToCandidateAutonomeEmail = async ({
  email,
  comment,
  certificationAuthorityLabel,
  certificationName,
}: {
  email: string;
  comment?: string;
  certificationAuthorityLabel: string;
  certificationName: string;
}) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_CANDIDATE_EMAILS",
  });

  if (useBrevoTemplate) {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 514,
      params: {
        certificationAuthorityLabel,
        certificationName,
        comment: comment,
      },
    });
  } else {
    const commentInfo = comment
      ? `
        <br/>
        <p><strong>Voici les remarques faites par le certificateur :</strong></p>
        <p><em>${formatFreeText(comment)}</em></p>
        `
      : "";

    const htmlContent = mjml2html(
      templateMail({
        content: `
        <p>Bonjour,</p>
        <p>Vous trouverez ci-dessous la décision de recevabilité du certificateur ${certificationAuthorityLabel} concernant votre dossier de faisabilité pour la certification ${certificationName}.</p>
        <p>Votre dossier a été jugé incomplet par le certificateur.</p>
        ${commentInfo}
        <h3><em>Que dois-je faire dans cette situation ?</em></h3>
        <p>Vous devez prendre connaissance des éléments manquants et renvoyer votre dossier mis à jour au certificateur. Il pourra ensuite réévaluer votre dossier et vous fournir une nouvelle réponse !</p>
        <p>Nous restons disponibles si vous avez besoin d’informations.</p>
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
      subject: "Votre dossier de faisabilité VAE est incomplet",
    });
  }
};
