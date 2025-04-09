import mjml2html from "mjml";

import { sendEmailWithLink, templateMail } from "../../shared/email";

export const sendCandidacyTransferToNewCertificationAuthorityEmail = ({
  email,
  previousCertificationAuthorityName,
  newCertificationAuthorityName,
  candidateName,
  transferReason,
  candidacyId,
}: {
  email: string;
  previousCertificationAuthorityName: string;
  newCertificationAuthorityName: string;
  candidateName: string;
  transferReason: string;
  candidacyId: string;
}) => {
  const htmlContent = (url: string) =>
    mjml2html(
      templateMail({
        content: `
          <p>Bonjour ${newCertificationAuthorityName},</p>
          <p>Le service ${previousCertificationAuthorityName} vous a transféré la candidature de ${candidateName} pour la raison suivante : ${transferReason}.</p>
          <p>Vous êtes désormais le nouveau certificateur en charge de ce dossier. Pour consulter la candidature, cliquez sur le bouton ci-dessous :</p>
         `,
        url,
        labelCTA: "Accéder à la candidature",
        bottomLine: `
        <p>Nous restons disponibles si vous avez la moindre question.</p>
        <p>Cordialement,</p>
        <p>L'équipe France VAE</p>
        `,
      }),
    );

  return sendEmailWithLink({
    to: { email },
    htmlContent,
    subject: "Une candidature vous a été transférée",
    customUrl: `/candidacies/${candidacyId}/feasibility/`,
    app: "admin",
  });
};
