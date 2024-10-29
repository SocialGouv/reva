import mjml2html from "mjml";

import {
  formatFreeText,
  sendGenericEmail,
  templateMail,
} from "../../shared/email";

export const sendDVReportedToCandidateAutonomeEmail = async ({
  email,
  decisionComment,
  certificationName,
  certificationAuthorityLabel,
}: {
  email: string;
  decisionComment?: string;
  certificationName: string;
  certificationAuthorityLabel: string;
}) => {
  const commentInfo = decisionComment
    ? `
        <p><strong>Voici les remarques faites par le certificateur :</strong></p>
        <p><em>${formatFreeText(decisionComment)}</em></p>
        `
    : "";
  const htmlContent = mjml2html(
    templateMail({
      content: `
      <p>Bonjour,</p>
      <p>Votre dossier de validation a été signalé par le certificateur ${certificationAuthorityLabel} concernant votre dossier de validation pour la certification <em>${certificationName}</em>.</p>
      ${commentInfo}
      <h3><em>Que puis-je faire dans cette situation ?</em></h3>
      <p>Vous devez renvoyer un dossier de validation sur votre Espace France VAE, en prenant en compte les remarques du certificateur. Si vous avez des questions au sujet de cette décision, nous vous conseillons de prendre directement contact avec le certificateur.</p>
      <p>Nous restons disponibles si vous avez besoin d’informations.</p>
      <p>Cordialement,</p>
      <p>L’équipe France VAE</p>
    `,
    }),
  );

  return sendGenericEmail({
    to: { email },
    htmlContent: htmlContent.html,
    subject: "Votre dossier de validation a été signalé",
  });
};
