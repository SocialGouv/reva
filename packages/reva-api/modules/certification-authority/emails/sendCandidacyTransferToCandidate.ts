import mjml2html from "mjml";

import { sendGenericEmail, templateMail } from "../../shared/email";

export const sendCandidacyTransferToCandidate = async ({
  email,
  newCertificationAuthorityName,
}: {
  email: string;
  newCertificationAuthorityName: string;
}) => {
  const htmlContent = mjml2html(
    templateMail({
      content: `
      <p>Bonjour,</p>
      <p>Nous vous informons que votre candidature a été transférée au gestionnaire de candidatures ${newCertificationAuthorityName}, à l'initiative du certificateur.</p>
      <p>Il sera ainsi le destinataire des différents documents liés à votre parcours (dossier de faisabilité, dossier de validation) et vous communiquera, via la plateforme, les informations liées à votre passage devant le jury.</p>
      
      <p>Nous vous souhaitons une bonne poursuite de parcours. </p>
      
      <p>Besoin d’aide ? Vous pouvez nous contacter à l’adresse support@vae.gouv.fr.</p>

      <p>Cordialement,</p>
      
      <p>L’équipe France VAE</p>
        `,
    }),
  );

  return sendGenericEmail({
    to: { email },
    htmlContent: htmlContent.html,
    subject: "Votre candidature a été transférée à un autre certificateur",
  });
};
