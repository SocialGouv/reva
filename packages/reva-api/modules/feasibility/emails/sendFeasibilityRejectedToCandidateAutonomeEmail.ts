import mjml2html from "mjml";

import {
  formatFreeText,
  sendGenericEmail,
  templateMail,
} from "../../shared/email";
import { UploadedFile } from "../../shared/file";
import { logger } from "../../shared/logger";

export const sendFeasibilityRejectedToCandidateAutonomeEmail = async ({
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
        <p>Votre dossier a été jugé non recevable par le certificateur.</p>
        ${commentInfo}
        <h3><em>Que puis-je faire dans cette situation ?</em></h3>
        <p>Vous pouvez contester l’avis du certificateur. Ce dernier vous fera parvenir dans un courrier les différentes voies de recours possibles.</p>
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

  const attachment = infoFile
    ? [{ name: infoFile.filename, content: infoFile._buf.toString("base64") }]
    : undefined;

  return sendGenericEmail({
    to: { email },
    htmlContent: htmlContent.html,
    subject: "Votre dossier de faisabilité VAE est non recevable",
    attachment,
  });
};
