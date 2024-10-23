import mjml2html from "mjml";

import {
  formatFreeText,
  sendGenericEmail,
  templateMail,
} from "../../shared/email";
import { UploadedFile } from "../../shared/file";
import { logger } from "../../shared/logger";

export const sendFeasibilityValidatedToCandidateAutonomeEmail = async ({
  email,
  comment,
  certifName,
  certificationAuthorityLabel,
  infoFile,
}: {
  email: string;
  comment?: string;
  certifName: string;
  certificationAuthorityLabel: string;
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
      <p>Vous trouverez ci-dessous la décision de recevabilité du certificateur ${certificationAuthorityLabel} concernant votre dossier de faisabilité pour la certification <em>${certifName}</em>.</p>
      <p>Félicitations, votre dossier a été jugé recevable par le certificateur et vous pouvez désormais démarrer votre parcours VAE.</p>
      <span>${commentInfo}</span>
      <h3>Quelles sont les prochaines étapes ?</h3>
      <p>Désormais, il vous faut travailler sur votre dossier de validation afin de prouver au jury que vous avez l’expérience et les connaissances nécessaires pour obtenir votre diplôme ! Nous vous recommandons de lire notre article <a href="https://vae.gouv.fr/savoir-plus/articles/rediger-dossier-validation/">“Comment rédiger son dossier de validation”</a> ou de consulter notre <a href="https://scribehow.com/shared/Tutoriel__Candidats_sans_AAP_autonome__0NQyq175SDaI0Epy7bdyLA?referrer=documents">tutoriel sur le parcours autonome</a> avant de débuter cette démarche.</p>
      <h3>Attention : dossier plagié = certification refusée ?</h3>
      <p>Vous allez bientôt commencer à rédiger votre dossier de validation. Conformément à <a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000048699565">l’article R6412-7 du Code du Travail</a>, le ministère ou l'organisme certificateur peut refuser de délivrer ou retirer la certification professionnelle si le dossier contient des éléments plagiés ou frauduleux. Vous aurez la possibilité de contester cette décision si vous êtes en désaccord avec l’avis du certificateur.</p>
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
    subject: "Votre dossier de faisabilité VAE a été examiné",
    attachment,
  });
};
