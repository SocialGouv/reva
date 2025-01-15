import mjml2html from "mjml";

import { sendGenericEmail, templateMail } from "../../shared/email";

export const sendAutoCandidacyDropOutConfirmationEmailToAap = async ({
  aapEmail,
  aapLabel,
  candidateFullName,
}: {
  aapEmail: string;
  aapLabel: string;
  candidateFullName: string;
}) => {
  const htmlContent = mjml2html(
    templateMail({
      content: `
      <div>Bonjour ${aapLabel},</div>
      <p>Vous aviez déclaré l'abandon de ${candidateFullName}. Le candidat n'a pas validé cet abandon, mais 6 mois se sont écoulés : l'abandon est donc confirmé automatiquement.</p>
      <p>Cordialement,</p>
      <p>L’équipe France VAE.</p>
        `,
    }),
  );

  return sendGenericEmail({
    to: { email: aapEmail },
    htmlContent: htmlContent.html,
    subject: "Confirmation d'abandon automatique",
  });
};
