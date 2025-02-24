import mjml2html from "mjml";

import {
  formatFreeText,
  sendEmailUsingTemplate,
  sendGenericEmail,
  templateMail,
} from "../../shared/email";
import { UploadedFile } from "../../shared/file";
import { logger } from "../../shared/logger";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const sendFeasibilityRejectedToCandidateAccompagneEmail = async ({
  email,
  comment,
  certificationAuthorityLabel,
  certificationName,
  infoFile,
}: {
  email: string;
  comment?: string;
  certificationAuthorityLabel: string;
  certificationName: string;
  infoFile?: UploadedFile;
}) => {
  const useBrevoTemplate = await isFeatureActiveForUser({
    feature: "USE_BREVO_EMAIL_TEMPLATES_FOR_CANDIDATE_EMAILS",
  });

  if (useBrevoTemplate) {
    const attachment = infoFile
      ? [{ name: infoFile.filename, content: infoFile._buf.toString("base64") }]
      : undefined;

    return sendEmailUsingTemplate({
      to: { email },
      templateId: 502,
      params: {
        certificationAuthorityLabel,
        certificationName,
        comment,
      },
      attachment,
    });
  } else {
    const commentInfo = comment
      ? `
        <br/>
        <p><strong>Voici les remarques faites par le certificateur</strong> (ces préconisations pourront être reprises avec votre accompagnateur) :</p>
        <p><em>${formatFreeText(comment)}</em></p>
        `
      : "";

    const htmlContent = mjml2html(
      templateMail({
        content: `
        <p>Bonjour,</p>
        <p>Vous trouverez ci-dessous la décision du certificateur ${certificationAuthorityLabel} concernant votre dossier de faisabilité.</p>
        <p>Malheureusement, votre dossier a été jugé non recevable par le certificateur. Nous vous invitons à prendre contact avec votre accompagnateur pour comprendre cette décision et échanger ensemble sur les suites à donner à votre parcours.</p>
        ${commentInfo}
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

    const attachment = infoFile
      ? [{ name: infoFile.filename, content: infoFile._buf.toString("base64") }]
      : undefined;

    return sendGenericEmail({
      to: { email },
      htmlContent: htmlContent.html,
      subject: "Votre dossier de faisabilité VAE est non recevable",
      attachment,
    });
  }
};
